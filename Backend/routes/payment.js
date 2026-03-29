const express = require("express");
const {
  getPayments,
  getPaymentById,
  getPaymentsByUserId,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../mongodb/controllers/paymentcontroller");

const routes = express.Router();

// Get all payments (admin)
routes.get("/", async (req, res) => {
  try {
    const result = await getPayments();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      err: error.message,
      msg: "Internal server error",
    });
  }
});

// Get payment by ID
routes.get("/:id", async (req, res) => {
  try {
    const result = await getPaymentById(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      err: error.message,
      msg: "Internal server error",
    });
  }
});

// Get payments by user ID
routes.get("/user/:userId", async (req, res) => {
  try {
    const result = await getPaymentsByUserId(req.params.userId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      err: error.message,
      msg: "Internal server error",
    });
  }
});

// Create a new payment
routes.post("/", async (req, res) => {
  try {
    const paymentData = req.body;
    const result = await createPayment(paymentData);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      err: error.message,
      msg: "Internal server error",
    });
  }
});

// Update payment
routes.put("/:id", async (req, res) => {
  try {
    const updateData = req.body;
    const result = await updatePayment(req.params.id, updateData);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      err: error.message,
      msg: "Internal server error",
    });
  }
});

// Delete payment
routes.delete("/:id", async (req, res) => {
  try {
    const result = await deletePayment(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      err: error.message,
      msg: "Internal server error",
    });
  }
});

module.exports = routes;