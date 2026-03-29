const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FlightBookingSchema = new Schema(
  {
    flightId: { type: String, unique: false, required: true },
    userId: { type: String, unique: false, required: true },
    username: { type: String, unique: false, required: true },
    isEconomyClass: {
      type: Boolean,
      unique: false,
      required: true,
    },
    economyClassTickets: {
      type: Number,
      unique: false,
      required: false,
      default: 0,
    },
    economyClassTicketCost: {
      type: Number,
      unique: false,
      required: false,
      default: 0,
    },
    isBusinessClass: {
      type: Boolean,
      unique: false,
      required: true,
    },
    businessClassTickets: {
      type: Number,
      unique: false,
      required: false,
      default: 0,
    },
    businessClassTicketCost: {
      type: Number,
      unique: false,
      required: false,
      default: 0,
    },
    isFirstClass: {
      type: Boolean,
      unique: false,
      required: true,
    },
    firstClassTickets: {
      type: Number,
      unique: false,
      required: false,
      default: 0,
    },
    firstClassTicketCost: {
      type: Number,
      unique: false,
      required: false,
      default: 0,
    },
    totalCost: {
      type: Number,
      unique: false,
      required: true,
    },

    // Compatibility fields for reporting/admin/docs format
    bookingId: { type: String, required: false, default: "" },
    passengers: { type: Number, required: false, default: 0 },
    passengerDetails: { type: Array, required: false, default: [] },
    status: { type: String, required: false, default: "pending" },
    totalPrice: { type: Number, required: false, default: 0 },
    flightDate: { type: String, required: false, default: "" },
    tickets: { type: Array, required: false, default: [] },
    // payment information
    paymentMethod: { type: String, required: false, default: "" },
    paymentStatus: { type: String, required: false, default: "pending" },
    transactionId: { type: String, required: false, default: "" },
    paidAt: { type: Date, required: false },
    paymentDetails: { type: Schema.Types.Mixed, required: false, default: {} },
  },
  { timestamps: true }
);

const FlightBookingModel = mongoose.model(
  "flight-bookings",
  FlightBookingSchema
);

module.exports = FlightBookingModel;
