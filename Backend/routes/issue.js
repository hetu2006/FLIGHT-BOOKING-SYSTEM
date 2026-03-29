const express = require("express");
const mongoose = require("mongoose");
const IssueModel = require("../mongodb/models/issuemodel");
const UserModel = require("../mongodb/models/usermodel");

const routes = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "open") return "Open";
  if (value === "in-progress" || value === "in progress") return "In Progress";
  if (value === "resolved") return "Resolved";
  if (value === "closed") return "Closed";
  return "Open";
};

const toIssueDto = (issueDoc) => ({
  _id: issueDoc._id,
  id: issueDoc._id,
  userId: issueDoc.userId,
  userName: issueDoc.userName,
  username: issueDoc.username || issueDoc.userName || "",
  email: issueDoc.email || "",
  subject: issueDoc.subject,
  description: issueDoc.description,
  issueType: issueDoc.issueType || "",
  issue: issueDoc.issue || issueDoc.description,
  status: issueDoc.status,
  resolution: issueDoc.resolution || "",
  createdAt: issueDoc.createdAt,
  updatedAt: issueDoc.updatedAt,
});

routes.post("/getissues", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Database connection unavailable",
      });
    }

    const isAdmin = ["admin", process.env.ADMIN].includes(req.user?.role);

    let query = {};
    if (!isAdmin) {
      query = { userId: req.user.id };
    }

    const issues = await IssueModel.find(query).sort({ createdAt: -1 }).lean();
    return res.json({
      isDone: true,
      isError: false,
      success: true,
      data: issues.map(toIssueDto),
      total: issues.length,
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to fetch issues",
    });
  }
});

routes.post("/addissue", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Database connection unavailable",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Invalid user id in token",
      });
    }

    const user = await UserModel.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "User not found",
      });
    }

    // Accept all current payload styles.
    const payload = req.body || {};
    const issueInput = payload.issue;

    const subject =
      payload.subject ||
      (issueInput && typeof issueInput === "object" ? issueInput.subject : "") ||
      "General Support";

    const description =
      payload.description ||
      (issueInput && typeof issueInput === "object"
        ? issueInput.description || issueInput.issue
        : issueInput) ||
      "Issue reported";

    if (!description || typeof description !== "string") {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Issue description is required",
      });
    }

    const issueType =
      payload.issueType ||
      (issueInput && typeof issueInput === "object" ? issueInput.issueType : "") ||
      "General";

    const issueToCreate = {
      userId: req.user.id,
      userName: user.name || req.user.username,
      username: req.user.username,
      email: user.email || req.user.email || "",
      subject,
      description,
      issueType,
      issue: description,
      status: normalizeStatus(payload.status),
    };

    const created = await IssueModel.create(issueToCreate);

    return res.status(201).json({
      isDone: true,
      isError: false,
      success: true,
      message: "Issue reported successfully",
      msg: "Issue reported successfully",
      data: toIssueDto(created.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to add issue",
    });
  }
});

module.exports = routes;
