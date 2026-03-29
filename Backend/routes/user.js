const express = require("express");
const {
  editUser,
  getUserById,
  changeUserPassword,
} = require("../mongodb/controllers/usercontroller");

const routes = express.Router();

const buildSafeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  phoneNo: user.phoneNo || "",
  address: user.address || "",
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

routes.post("/userdata", async (req, res) => {
  try {
    const result = await getUserById(req.user.id);

    if (result.isError) {
      return res.status(404).json(result);
    }

    const user = result.data && result.data[0] ? result.data[0] : null;
    if (!user) {
      return res.status(404).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "User not found",
      });
    }

    const safeUser = buildSafeUser(user);

    return res.json({
      isDone: true,
      isError: false,
      success: true,
      data: [safeUser],
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to fetch user",
    });
  }
});

const handleUpdateProfile = async (req, res) => {
  try {
    const updateData = req.body?.data || req.body;

    if (!updateData || typeof updateData !== "object") {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Update data is required",
      });
    }

    const result = await editUser(req.user.id, updateData);
    if (result.isError) {
      return res.status(400).json({ ...result, success: false });
    }

    return res.json({
      ...result,
      success: true,
      message: "Profile updated successfully",
      msg: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to update profile",
    });
  }
};

// Existing endpoint
routes.put("/edit", handleUpdateProfile);
// Compatibility endpoint used by current frontend/docs
routes.post("/updatedata", handleUpdateProfile);

routes.post("/changepassword", async (req, res) => {
  try {
    const bodyData = req.body?.data || req.body || {};
    const oldPassword = bodyData.oldpassword || bodyData.oldPassword;
    const newPassword = bodyData.newpassword || bodyData.newPassword;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "oldPassword and newPassword are required",
      });
    }

    const result = await changeUserPassword(req.user.id, oldPassword, newPassword);
    if (result.isError) {
      return res.status(400).json({ ...result, success: false });
    }

    return res.json({
      ...result,
      success: true,
      message: "Password changed successfully",
      msg: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to change password",
    });
  }
});

module.exports = routes;
