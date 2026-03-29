const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: { type: String, default: "" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },
    reply: { type: String, default: "" },
  },
  { timestamps: true }
);

const ContactModel = mongoose.model("contacts", ContactSchema);

module.exports = ContactModel;
