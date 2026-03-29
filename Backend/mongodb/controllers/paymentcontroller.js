const mongoose = require("mongoose");
const PaymentModel = require("../models/paymentmodel");

const isDbConnected = () => mongoose.connection.readyState === 1;

const getDbError = () => ({
  isDone: false,
  isError: true,
  success: false,
  err: "Database connection unavailable",
  msg: "Database connection unavailable",
});

// Get all payments
const getPayments = async () => {
  try {
    if (!isDbConnected()) return getDbError();

    const data = await PaymentModel.find({}).lean();
    return {
      isDone: true,
      isError: false,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Get payment by ID
const getPaymentById = async (id) => {
  try {
    if (!isDbConnected()) return getDbError();

    const data = await PaymentModel.findById(id).lean();
    if (!data) {
      return {
        isDone: false,
        isError: true,
        err: "Payment not found",
        msg: "Payment not found",
      };
    }
    return {
      isDone: true,
      isError: false,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Get payments by user ID
const getPaymentsByUserId = async (userId) => {
  try {
    if (!isDbConnected()) return getDbError();

    const data = await PaymentModel.find({ userId }).lean();
    return {
      isDone: true,
      isError: false,
      data,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Create a new payment
const createPayment = async (paymentData) => {
  try {
    if (!isDbConnected()) return getDbError();

    const newPayment = new PaymentModel(paymentData);
    const savedPayment = await newPayment.save();
    return {
      isDone: true,
      isError: false,
      data: savedPayment,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Update payment
const updatePayment = async (id, updateData) => {
  try {
    if (!isDbConnected()) return getDbError();

    const updatedPayment = await PaymentModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPayment) {
      return {
        isDone: false,
        isError: true,
        err: "Payment not found",
        msg: "Payment not found",
      };
    }
    return {
      isDone: true,
      isError: false,
      data: updatedPayment,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

// Delete payment
const deletePayment = async (id) => {
  try {
    if (!isDbConnected()) return getDbError();

    const deletedPayment = await PaymentModel.findByIdAndDelete(id);
    if (!deletedPayment) {
      return {
        isDone: false,
        isError: true,
        err: "Payment not found",
        msg: "Payment not found",
      };
    }
    return {
      isDone: true,
      isError: false,
      data: deletedPayment,
    };
  } catch (err) {
    return { isDone: false, isError: true, err: err.message || err };
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  getPaymentsByUserId,
  createPayment,
  updatePayment,
  deletePayment,
};