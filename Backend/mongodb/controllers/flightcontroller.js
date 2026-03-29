const mongoose = require("mongoose");
const FlightModel = require("../models/flightmodel");

const isDbConnected = () => mongoose.connection.readyState === 1;

const getDbError = () => ({
  isDone: false,
  isError: true,
  success: false,
  err: "Database connection unavailable",
  message: "Database connection unavailable",
});

// Get all flights
const getFlights = async (filters) => {
  try {
    if (!isDbConnected()) return getDbError();

    const normalizedFilters = { ...(filters || {}) };
    if (normalizedFilters.source && !normalizedFilters.routeSource) {
      normalizedFilters.routeSource = normalizedFilters.source;
    }
    if (normalizedFilters.destination && !normalizedFilters.routeDestination) {
      normalizedFilters.routeDestination = normalizedFilters.destination;
    }
    if (normalizedFilters.date && !normalizedFilters.departureDate) {
      normalizedFilters.departureDate = normalizedFilters.date;
    }

    delete normalizedFilters.source;
    delete normalizedFilters.destination;
    delete normalizedFilters.date;

    const data = await FlightModel.find(normalizedFilters).lean();

    const departureDate =
      normalizedFilters?.departureDate || new Date().toISOString().split("T")[0];

    const departureDateFlights = data.filter(
      (flight) => flight.departureDate === departureDate || !flight.departureDate
    );

    const afterDepartureDateFlights = data.filter(
      (flight) => flight.departureDate && flight.departureDate !== departureDate
    );

    return {
      isDone: true,
      isError: false,
      success: true,
      data: {
        departureDateFlights:
          departureDateFlights.length > 0 ? departureDateFlights : data,
        afterDepartureDateFlights,
        allFlights: data,
      },
      total: data.length,
      message: `Found ${data.length} flights`,
    };
  } catch (err) {
    return {
      isDone: false,
      isError: true,
      success: false,
      err: err.message,
      message: "Failed to fetch flights",
    };
  }
};

// Add New Flight
const addFlight = async (flightdata) => {
  try {
    if (!isDbConnected()) return getDbError();

    const flightToAdd = {
      ...flightdata,
      updatedAt: new Date(),
    };

    const data = await FlightModel.insertMany([flightToAdd]);
    return {
      isDone: true,
      isError: false,
      success: true,
      data,
      message: "Flight added successfully",
    };
  } catch (err) {
    return {
      isDone: false,
      isError: true,
      success: false,
      err: err.message,
      message: "Failed to add flight",
    };
  }
};

// Find flight by id
const findFlightById = async (flightId) => {
  try {
    if (!isDbConnected()) return getDbError();

    const data = await FlightModel.find({ _id: flightId }).lean();
    return { isDone: true, isError: false, success: true, data };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

// Edit/Update Flight
const editFlight = async (flightId, updateData) => {
  try {
    if (!isDbConnected()) return getDbError();
    if (!flightId) {
      return { isDone: false, isError: true, success: false, msg: "Flight ID is required" };
    }

    const data = await FlightModel.findByIdAndUpdate(flightId, updateData, {
      new: true,
    });

    if (!data) {
      return { isDone: false, isError: true, success: false, msg: "Flight not found" };
    }

    return { isDone: true, isError: false, success: true, data: { modifiedCount: 1 } };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

// Delete Flight
const deleteFlight = async (flightId) => {
  try {
    if (!isDbConnected()) return getDbError();
    if (!flightId) {
      return { isDone: false, isError: true, success: false, msg: "Flight ID is required" };
    }

    const data = await FlightModel.findByIdAndDelete(flightId);

    if (!data) {
      return { isDone: false, isError: true, success: false, msg: "Flight not found" };
    }

    return { isDone: true, isError: false, success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

module.exports = {
  getFlights,
  addFlight,
  findFlightById,
  editFlight,
  deleteFlight,
};
