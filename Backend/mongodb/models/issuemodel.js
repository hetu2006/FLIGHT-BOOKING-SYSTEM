const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
      "open",
      "in-progress",
      "resolved",
      "closed",
    ],
    default: "Open",
    required: true,
  },
  issueType: {
    type: String,
    default: "",
  },
  issue: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  resolution: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
IssueSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Also update updatedAt on findByIdAndUpdate
IssueSchema.pre("findByIdAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const IssueModel = mongoose.model("issues", IssueSchema);

module.exports = IssueModel;
