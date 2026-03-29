const express = require("express");
const { createContact } = require("../mongodb/controllers/admincontroller");

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const result = await createContact(req.body?.data || req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unable to submit contact request",
    });
  }
});

module.exports = router;
