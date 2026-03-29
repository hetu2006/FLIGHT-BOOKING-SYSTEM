const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FlightSchema = new Schema(
  {
    // Core model fields used by current booking UI
    name: { type: String, unique: false, required: true },
    departureDate: { type: String, unique: false, required: true },
    departureTime: { type: String, unique: false, required: true },
    returnDate: { type: String, unique: false, required: true },
    returnTime: { type: String, unique: false, required: true },
    routeSource: {
      type: String,
      unique: false,
      required: true,
    },
    routeDestination: {
      type: String,
      unique: false,
      required: true,
    },
    flightDuration: {
      type: String,
      unique: false,
      required: true,
    },
    isEconomyClass: {
      type: Boolean,
      unique: false,
      required: true,
    },
    economyClassTicketCost: {
      type: Number,
      unique: false,
      required: false,
    },
    economyClassTotalSeats: {
      type: Number,
      unique: false,
      required: false,
    },
    economyClassRemainingSeats: {
      type: Number,
      unique: false,
      required: false,
    },
    isBusinessClass: {
      type: Boolean,
      unique: false,
      required: true,
    },
    businessClassTicketCost: {
      type: Number,
      unique: false,
      required: false,
    },
    businessClassTotalSeats: {
      type: Number,
      unique: false,
      required: false,
    },
    businessClassRemainingSeats: {
      type: Number,
      unique: false,
      required: false,
    },
    isFirstClass: {
      type: Boolean,
      unique: false,
      required: true,
    },
    firstClassTicketCost: {
      type: Number,
      unique: false,
      required: false,
    },
    firstClassTotalSeats: {
      type: Number,
      unique: false,
      required: false,
    },
    firstClassRemainingSeats: {
      type: Number,
      unique: false,
      required: false,
    },

    // Compatibility fields for docs/admin panel payload shape
    flightNumber: { type: String, required: false, default: "" },
    airline: { type: String, required: false, default: "" },
    source: { type: String, required: false, default: "" },
    destination: { type: String, required: false, default: "" },
    arrivalTime: { type: String, required: false, default: "" },
    duration: { type: String, required: false, default: "" },
    price: { type: Number, required: false, default: 0 },
    totalSeats: { type: Number, required: false, default: 0 },
    availableSeats: { type: Number, required: false, default: 0 },
    date: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

const FlightModel = mongoose.model("flights", FlightSchema);

module.exports = FlightModel;
