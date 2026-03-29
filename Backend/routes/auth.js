const express = require("express");
const { generateAccessToken } = require("../helpingfunctions/jwt");

const {
  isUserPresent,
  isEmailPresent,
  createUser,
  validateUser,
  getUserById,
  getUserByUsername
} = require("../mongodb/controllers/usercontroller");

// helper to ensure default admin credentials
const ensureDefaultAdmin = async () => {
  const defaultUsername = "admin";
  const defaultPassword = "admin@123";
  const defaultEmail = "admin@flightdemo.com"; // keep same as sample-data

  const UserModel = require("../mongodb/models/usermodel");
  const { comparePassword, encryptPassword } = require("../helpingfunctions/bcrypt");

  const existResult = await getUserByUsername(defaultUsername);
  const existing = existResult?.data?.[0];
  if (!existing) {
    // create with same name/email/password
    await createUser({
      name: "System Admin",
      username: defaultUsername,
      email: defaultEmail,
      password: defaultPassword,
      role: process.env.ADMIN || "admin",
    });
    console.log("Default admin user created");
  } else {
    // ensure password matches default, update if not
    const cmp = await comparePassword(defaultPassword, existing.password);
    if (!cmp.isAuthorized) {
      const hashed = await encryptPassword(defaultPassword);
      if (!hashed.isError) {
        await UserModel.updateOne(
          { _id: existing._id },
          { $set: { password: hashed.hashedPassword } }
        );
        console.log("Default admin password reset");
      }
    }
  }
};
const { authenticateToken } = require("../helpingfunctions/jwt");

const route = express.Router();

route.post("/signup", async (req, res) => {
  try {
    const usernameFromBody = req.body?.username
      ? String(req.body.username).trim()
      : "";
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : "";
    const username = usernameFromBody || (email ? email.split("@")[0] : "");

    if (!req.body?.name || !email || !req.body?.password) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "name, email and password are required",
      });
    }

    if (!username) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "username could not be derived from request",
      });
    }

    const usernameExists = await isUserPresent(username);
    if (usernameExists) {
      return res.status(409).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Username already exists",
      });
    }

    const emailExists = await isEmailPresent(email);
    if (emailExists) {
      return res.status(409).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Email already exists",
      });
    }

    const data = await createUser({ ...req.body, username, email });
    if (data.isError) {
      return res.status(400).json({ ...data, success: false });
    }

    const userDoc = Array.isArray(data.data) ? data.data[0] : null;
    const user = userDoc
      ? {
          _id: userDoc._id,
          id: userDoc._id,
          name: userDoc.name,
          username: userDoc.username,
          email: userDoc.email,
          role: userDoc.role,
          phoneNo: userDoc.phoneNo || "",
          address: userDoc.address || "",
        }
      : null;

    let token = "";
    if (user) {
      token = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    }

    return res.status(201).json({
      isDone: true,
      isError: false,
      success: true,
      message: "User registered successfully",
      msg: "User registered successfully",
      token,
      user,
      id: user?.id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      name: user?.name,
      data: data.data,
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Signup failed",
    });
  }
});

route.post("/login", async (req, res) => {
  try {
    const identifier = req.body?.username || req.body?.email || req.body?.name;
    const password = req.body?.password;

    // if using the manual admin credentials, create admin user if missing
    if (
      (identifier === "admin" || identifier === "admin@flightdemo.com") &&
      password === "admin@123"
    ) {
      await ensureDefaultAdmin();
    }

    const data = await validateUser(identifier, password);

    if (data.isError) {
      return res.status(401).json({ ...data, success: false });
    }

    if (!data.isAuthorized) {
      return res.status(401).json({
        ...data,
        success: false,
        msg: "Please enter valid password",
      });
    }

    const userdata = {
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      role: data.data.role,
      name: data.data.name,
    };

    const token = generateAccessToken(userdata);

    return res.json({
      isDone: true,
      isError: false,
      success: true,
      message: "Login successful",
      msg: "Login successful",
      token,
      id: data.data._id,
      username: data.data.username,
      email: data.data.email,
      role: data.data.role,
      name: data.data.name,
      user: {
        _id: data.data._id,
        id: data.data._id,
        username: data.data.username,
        email: data.data.email,
        role: data.data.role,
        name: data.data.name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Login failed",
    });
  }
});

const buildSafeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  phoneNo: user.phoneNo || "",
  address: user.address || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const handleGetLoggedInUser = async (req, res) => {
  try {
    const result = await getUserById(req.user.id);
    if (result.isError || !result.data || !result.data[0]) {
      return res.status(404).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "User not found",
      });
    }

    const user = buildSafeUser(result.data[0]);
    return res.json({
      isDone: true,
      isError: false,
      success: true,
      user,
      data: [user],
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to fetch logged in user",
    });
  }
};

route.get("/me", authenticateToken, handleGetLoggedInUser);
route.post("/logindata", authenticateToken, handleGetLoggedInUser);

module.exports = route;
