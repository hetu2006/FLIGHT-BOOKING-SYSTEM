const mongoose = require("mongoose");
const UserModel = require("../models/usermodel");
const {
  encryptPassword,
  comparePassword,
} = require("../../helpingfunctions/bcrypt");

const isDbConnected = () => mongoose.connection.readyState === 1;
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDbErrorResponse = (msg = "Database connection unavailable") => ({
  isDone: false,
  isError: true,
  msg,
  err: msg,
});

// Get all users
const getUsers = async () => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    const data = await UserModel.find({}).select("-password").lean();
    return {
      isDone: true,
      isError: false,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

const getUserByUsername = async (username) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    const data = await UserModel.find({ username }).select("-password").lean();
    return {
      isDone: true,
      isError: false,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

const getUserByEmail = async (email) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    const data = await UserModel.find({ email }).select("-password").lean();
    return {
      isDone: true,
      isError: false,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

const getUserById = async (id, includePassword = false) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    const query = UserModel.findById(id);
    if (!includePassword) query.select("-password");

    const data = await query.lean();
    if (!data) {
      return { isDone: false, isError: true, msg: "User not found" };
    }

    return { isDone: true, isError: false, data: [data] };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Create New User
const createUser = async (userdata) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    const email = userdata?.email ? String(userdata.email).toLowerCase().trim() : "";
    const username = userdata?.username
      ? String(userdata.username).trim()
      : email
      ? email.split("@")[0]
      : "";

    if (!username || !email || !userdata?.password || !userdata?.name) {
      return {
        isDone: false,
        isError: true,
        msg: "name, email, username and password are required",
      };
    }

    const hashedData = await encryptPassword(userdata.password);
    if (hashedData.isError) {
      return hashedData;
    }

    const userToCreate = {
      ...userdata,
      username,
      email,
      role: userdata?.role || process.env.USER,
      password: hashedData.hashedPassword,
    };

    const data = await UserModel.insertMany([userToCreate]);
    return { isDone: true, isError: false, data };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Validate user by username OR email
const validateUser = async (identifier, password) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    const normalized = identifier ? String(identifier).trim() : "";
    if (!normalized || !password) {
      return {
        isDone: false,
        isError: true,
        msg: "username/email/name and password are required",
      };
    }

    const exactMatchRegex = new RegExp(`^${escapeRegex(normalized)}$`, "i");
    const data = await UserModel.findOne({
      $or: [
        { username: exactMatchRegex },
        { email: normalized.toLowerCase() },
        { email: exactMatchRegex },
        { name: exactMatchRegex },
      ],
    });

    if (!data) {
      return {
        isDone: false,
        isError: true,
        msg: "Please enter valid username, email or name",
      };
    }

    const compareData = await comparePassword(password, data.password);
    if (compareData.isError) return compareData;
    if (!compareData.isAuthorized) return compareData;

    return {
      ...compareData,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Edit User
const editUser = async (userId, updateData) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();
    if (!userId || !updateData) {
      return { isDone: false, isError: true, msg: "User ID and update data are required" };
    }

    const sanitized = { ...updateData };
    delete sanitized.password;

    const result = await UserModel.updateOne({ _id: userId }, { $set: sanitized });

    if (result.matchedCount === 0) {
      return { isDone: false, isError: true, msg: "User not found" };
    }

    return { isDone: true, isError: false, data: { modifiedCount: result.modifiedCount } };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

const changeUserPassword = async (userId, oldPassword, newPassword) => {
  try {
    if (!isDbConnected()) return getDbErrorResponse();

    if (!userId || !oldPassword || !newPassword) {
      return {
        isDone: false,
        isError: true,
        msg: "userId, oldPassword and newPassword are required",
      };
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return { isDone: false, isError: true, msg: "User not found" };
    }

    const compareData = await comparePassword(oldPassword, user.password);
    if (compareData.isError) return compareData;
    if (!compareData.isAuthorized) {
      return {
        ...compareData,
        isDone: false,
        isError: true,
        msg: "Old password is incorrect",
      };
    }

    const hashedData = await encryptPassword(newPassword);
    if (hashedData.isError) return hashedData;

    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { password: hashedData.hashedPassword } }
    );

    return {
      isDone: true,
      isError: false,
      data: { modifiedCount: result.modifiedCount },
      msg: "Password changed successfully",
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

const isUserPresent = async (username) => {
  if (!username || !isDbConnected()) return false;
  const data = await UserModel.find({ username: String(username).trim() }).lean();
  return data.length > 0;
};

const isEmailPresent = async (email) => {
  if (!email || !isDbConnected()) return false;
  const data = await UserModel.find({ email: String(email).toLowerCase().trim() }).lean();
  return data.length > 0;
};

module.exports = {
  createUser,
  getUsers,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  isUserPresent,
  isEmailPresent,
  validateUser,
  editUser,
  changeUserPassword,
};
