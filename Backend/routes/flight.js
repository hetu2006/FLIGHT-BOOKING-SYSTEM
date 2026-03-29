const express = require("express");
const mongoose = require("mongoose");
const {
  getFlights,
  addFlight,
  editFlight,
  deleteFlight,
} = require("../mongodb/controllers/flightcontroller");
const FlightModel = require("../mongodb/models/flightmodel");

const {
  addFlightBookings,
  getFlightBookingsById,
  editFlightBooking,
  deleteFlightBooking,
} = require("../mongodb/controllers/flightbookingcontroller");
const FlightBookingModel = require("../mongodb/models/flightbookingmodel");

const routes = express.Router();

const today = () => new Date().toISOString().split("T")[0];

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeFlightPayload = (input = {}) => {
  const source = input.routeSource || input.source;
  const destination = input.routeDestination || input.destination;

  const departureDate = input.departureDate || input.date || today();
  const returnDate = input.returnDate || departureDate;

  const departureTime = String(input.departureTime || "");
  const arrivalTime = String(input.arrivalTime || "");
  const returnTime = String(input.returnTime || arrivalTime || departureTime || "");

  const totalSeats =
    toNumber(input.totalSeats, 0) ||
    toNumber(input.economyClassTotalSeats, 0) +
      toNumber(input.businessClassTotalSeats, 0) +
      toNumber(input.firstClassTotalSeats, 0);

  const availableSeats =
    toNumber(input.availableSeats, 0) ||
    toNumber(input.economyClassRemainingSeats, 0) +
      toNumber(input.businessClassRemainingSeats, 0) +
      toNumber(input.firstClassRemainingSeats, 0) ||
    totalSeats;

  const price = toNumber(input.price, 0) || toNumber(input.economyClassTicketCost, 0);

  const isEconomyClass =
    typeof input.isEconomyClass === "boolean" ? input.isEconomyClass : true;
  const isBusinessClass =
    typeof input.isBusinessClass === "boolean" ? input.isBusinessClass : false;
  const isFirstClass =
    typeof input.isFirstClass === "boolean" ? input.isFirstClass : false;

  return {
    name:
      input.name ||
      [input.airline, input.flightNumber].filter(Boolean).join(" ") ||
      `${source || "Unknown"}-${destination || "Unknown"}`,
    departureDate,
    departureTime: departureTime || "00:00",
    returnDate,
    returnTime: returnTime || "00:00",
    routeSource: source,
    routeDestination: destination,
    flightDuration: input.flightDuration || input.duration || "N/A",

    isEconomyClass,
    economyClassTicketCost: toNumber(input.economyClassTicketCost, price),
    economyClassTotalSeats: toNumber(input.economyClassTotalSeats, totalSeats),
    economyClassRemainingSeats: toNumber(
      input.economyClassRemainingSeats,
      toNumber(input.economyClassTotalSeats, totalSeats)
    ),

    isBusinessClass,
    businessClassTicketCost: toNumber(input.businessClassTicketCost, 0),
    businessClassTotalSeats: toNumber(input.businessClassTotalSeats, 0),
    businessClassRemainingSeats: toNumber(
      input.businessClassRemainingSeats,
      toNumber(input.businessClassTotalSeats, 0)
    ),

    isFirstClass,
    firstClassTicketCost: toNumber(input.firstClassTicketCost, 0),
    firstClassTotalSeats: toNumber(input.firstClassTotalSeats, 0),
    firstClassRemainingSeats: toNumber(
      input.firstClassRemainingSeats,
      toNumber(input.firstClassTotalSeats, 0)
    ),

    // Compatibility fields
    flightNumber: input.flightNumber || "",
    airline: input.airline || "",
    source: source || "",
    destination: destination || "",
    arrivalTime,
    duration: input.duration || input.flightDuration || "N/A",
    price,
    totalSeats,
    availableSeats,
    date: input.date || departureDate,
  };
};

const normalizeFilters = (filters = {}) => {
  const finalFilters = { ...filters };

  if (finalFilters.source && !finalFilters.routeSource) {
    finalFilters.routeSource = finalFilters.source;
  }
  if (finalFilters.destination && !finalFilters.routeDestination) {
    finalFilters.routeDestination = finalFilters.destination;
  }
  if (finalFilters.date && !finalFilters.departureDate) {
    finalFilters.departureDate = finalFilters.date;
  }

  delete finalFilters.source;
  delete finalFilters.destination;
  delete finalFilters.date;

  return finalFilters;
};

const buildTickets = (prefix, className, count) => {
  const tickets = [];
  for (let i = 1; i <= count; i++) {
    tickets.push({ className, ticketNo: `${prefix}--${className}-${i}` });
  }
  return tickets;
};

const normalizeBookingPayload = async (body = {}, user = {}) => {
  const raw = body.data && typeof body.data === "object" ? body.data : body;
  if (!raw || typeof raw !== "object") {
    return { error: "Booking payload is required" };
  }

  if (!raw.flightId) {
    return { error: "flightId is required" };
  }

  const passengers = toNumber(raw.passengers, 0);

  let isEconomyClass =
    typeof raw.isEconomyClass === "boolean" ? raw.isEconomyClass : false;
  let isBusinessClass =
    typeof raw.isBusinessClass === "boolean" ? raw.isBusinessClass : false;
  let isFirstClass =
    typeof raw.isFirstClass === "boolean" ? raw.isFirstClass : false;

  let economyClassTickets = toNumber(raw.economyClassTickets, 0);
  let businessClassTickets = toNumber(raw.businessClassTickets, 0);
  let firstClassTickets = toNumber(raw.firstClassTickets, 0);

  if (passengers > 0 && !isEconomyClass && !isBusinessClass && !isFirstClass) {
    isEconomyClass = true;
    economyClassTickets = passengers;
  }

  if (isEconomyClass && economyClassTickets <= 0 && passengers > 0) {
    economyClassTickets = passengers;
  }

  if (!isEconomyClass) economyClassTickets = 0;
  if (!isBusinessClass) businessClassTickets = 0;
  if (!isFirstClass) firstClassTickets = 0;

  const totalTickets = economyClassTickets + businessClassTickets + firstClassTickets;
  if (totalTickets <= 0) {
    return { error: "At least one ticket is required" };
  }

  let flight = null;
  if (mongoose.Types.ObjectId.isValid(raw.flightId)) {
    flight = await FlightModel.findById(raw.flightId).lean();
  }

  const economyRate = toNumber(
    raw.economyClassTicketCost,
    flight?.economyClassTicketCost || 0
  );
  const businessRate = toNumber(
    raw.businessClassTicketCost,
    flight?.businessClassTicketCost || 0
  );
  const firstRate = toNumber(
    raw.firstClassTicketCost,
    flight?.firstClassTicketCost || 0
  );

  const computedTotal =
    economyClassTickets * economyRate +
    businessClassTickets * businessRate +
    firstClassTickets * firstRate;

  const totalCost = toNumber(raw.totalCost, computedTotal);

  const ticketPrefix = `BK${Date.now()}`;
  const tickets = [
    ...buildTickets(ticketPrefix, "Economy", economyClassTickets),
    ...buildTickets(ticketPrefix, "Business", businessClassTickets),
    ...buildTickets(ticketPrefix, "First", firstClassTickets),
  ];

  const bookingId = raw.bookingId || `${ticketPrefix}${Math.floor(Math.random() * 1000)}`;

  // copy any incoming payment info (gateway simulation)
  const paymentMethod = raw.payment?.method || raw.paymentMethod || '';
  const paymentStatus = String(raw.payment?.status || raw.paymentStatus || 'pending').toLowerCase();
  const transactionId = raw.payment?.transactionId || raw.transactionId || '';
  const paidAt = raw.payment?.paidAt ? new Date(raw.payment.paidAt) : undefined;
  const paymentDetails = raw.payment?.details || raw.paymentDetails || {};

  const resolvedUserId = (user && user.id) ? String(user.id) : String(raw.userId || '');
  const resolvedUsername = (user && user.username) ? user.username : (raw.username || raw.userName || '');
  const resolvedEmail = (user && user.email) ? user.email : (raw.email || raw.userEmail || '');
  const resolvedPhone = (user && user.phoneNo) ? user.phoneNo : (raw.phoneNo || raw.mobile || '');

  return {
    data: {
      flightId: String(raw.flightId),
      userId: resolvedUserId,
      username: resolvedUsername,
      userEmail: resolvedEmail,
      userPhone: resolvedPhone,

      isEconomyClass,
      economyClassTickets,
      economyClassTicketCost: economyClassTickets * economyRate,

      isBusinessClass,
      businessClassTickets,
      businessClassTicketCost: businessClassTickets * businessRate,

      isFirstClass,
      firstClassTickets,
      firstClassTicketCost: firstClassTickets * firstRate,

      totalCost,
      totalPrice: totalCost,
      passengers: totalTickets,
      passengerDetails: Array.isArray(raw.passengerDetails) ? raw.passengerDetails : [],
      status: String(raw.status || "pending").toLowerCase(),
      bookingId,
      flightDate: raw.flightDate || flight?.departureDate || "",
      tickets,

      paymentMethod,
      paymentStatus,
      transactionId,
      paidAt,
      paymentDetails,
    },
  };
};

// Get all flights
routes.post("/getflights", async (req, res) => {
  try {
    const result = await getFlights(normalizeFilters(req.body?.filters || {}));
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to fetch flights",
    });
  }
});

const addFlightHandler = async (req, res) => {
  try {
    const rawData = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
    const data = normalizeFlightPayload(rawData || {});

    if (!data.routeSource || !data.routeDestination) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "source/routeSource and destination/routeDestination are required",
      });
    }

    const result = await addFlight(data);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to add flight",
    });
  }
};

// Add new Flights (support both cases)
routes.post("/addflight", addFlightHandler);
routes.post("/addFlight", addFlightHandler);

// Edit Flight
routes.put("/editflight/:id", async (req, res) => {
  try {
    const flightId = req.params.id;
    const updateData = req.body.data || req.body;

    if (!updateData) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Update data is required",
      });
    }

    const hasLegacyKeys = [
      "source",
      "destination",
      "flightNumber",
      "airline",
      "price",
      "totalSeats",
      "availableSeats",
      "date",
    ].some((key) => Object.prototype.hasOwnProperty.call(updateData, key));

    const payload = hasLegacyKeys
      ? normalizeFlightPayload({ ...updateData })
      : updateData;

    const result = await editFlight(flightId, payload);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to update flight",
    });
  }
});

// Delete Flight
routes.delete("/deleteflight/:id", async (req, res) => {
  try {
    const result = await deleteFlight(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to delete flight",
    });
  }
});

// Add new flight booking (crash-safe)
routes.post("/booking/newbooking", async (req, res) => {
  try {
    const normalized = await normalizeBookingPayload(req.body, req.user);
    if (normalized.error) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: normalized.error,
      });
    }

    const result = await addFlightBookings(normalized.data);
    if (result.isError) {
      return res.status(400).json({ ...result, success: false });
    }

    return res.status(201).json({
      ...result,
      success: true,
      message: "Booking created successfully",
      msg: "Booking created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to create booking",
    });
  }
});

// Endpoint to process payment and create booking
routes.post("/booking/pay", async (req, res) => {
  try {
    const normalized = await normalizeBookingPayload(req.body, req.user);
    if (normalized.error) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: normalized.error,
      });
    }

    // simulate payment success
    normalized.data.paymentMethod = req.body.payment?.method || '';
    normalized.data.paymentStatus = 'paid';
    normalized.data.transactionId = `TX${Date.now()}`;
    normalized.data.paidAt = new Date();
    normalized.data.paymentDetails = req.body.payment?.details || {};

    const result = await addFlightBookings(normalized.data);
    if (result.isError) {
      return res.status(400).json({ ...result, success: false });
    }

    return res.status(201).json({
      ...result,
      success: true,
      message: 'Payment processed and booking created',
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || 'Unable to process payment',
    });
  }
});

// Get user's bookings
routes.post("/booking/getbookings", async (req, res) => {
  try {
    const result = await getFlightBookingsById(req.user.id);
    // auto-complete booking status for flights in past
    if (!result.isError && Array.isArray(result.data)) {
      const now = new Date();
      for (const b of result.data) {
        if (b.status === "confirmed") {
          const flightDate = new Date(b.flightDate || b.departureDate || b.createdAt);
          if (flightDate < now) {
            await editFlightBooking(b._id, { status: "completed" });
          }
        }
      }
    }
    return res.json(await getFlightBookingsById(req.user.id));
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to fetch bookings",
    });
  }
});

// Edit Flight Booking
routes.put("/booking/editbooking/:id", async (req, res) => {
  try {
    const updateData = req.body.data || req.body;

    if (!updateData) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: "Update data is required",
      });
    }

    // User cancellation flow: only pending can be cancelled
    if (updateData.status === "cancelled" || updateData.status === "canceled") {
      const booking = await FlightBookingModel.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ isDone: false, isError: true, success: false, msg: "Booking not found" });
      }
      if (booking.status !== "pending" && booking.status !== "confirmed") {
        return res.status(400).json({ isDone: false, isError: true, success: false, msg: "Only pending or confirmed bookings can be cancelled" });
      }
      if (booking.status === "confirmed") {
        const flight = await FlightModel.findById(booking.flightId);
        if (flight) {
          flight.availableSeats = Number(flight.availableSeats || 0) + (booking.passengers || 1);
          await flight.save();
        }
      }
      updateData.status = "cancelled";
      updateData.paymentStatus = updateData.paymentStatus || booking.paymentStatus;
    }

    const result = await editFlightBooking(req.params.id, updateData);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to update booking",
    });
  }
});

// Delete Flight Booking
routes.delete("/booking/deletebooking/:id", async (req, res) => {
  try {
    const result = await deleteFlightBooking(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || "Unable to delete booking",
    });
  }
});

// Admin flight list (used by the admin panel)
routes.post('/admin/flights/list', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(500).json(getDbError());
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    let flights = await FlightModel.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FlightModel.countDocuments();

    // normalize each document for consistent frontend display
    flights = flights.map((f) => formatFlight(f));

    return res.json({
      isDone: true,
      isError: false,
      success: true,
      data: flights,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || 'Unable to fetch admin flights list',
    });
  }
});

// also provide GET variant for easier testing/debugging
routes.get('/admin/flights/list', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(500).json(getDbError());
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let flights = await FlightModel.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FlightModel.countDocuments();
    flights = flights.map((f) => formatFlight(f));

    return res.json({
      isDone: true,
      isError: false,
      success: true,
      data: flights,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || 'Unable to fetch admin flights list',
    });
  }
});

// Admin create flight (reuse addFlightHandler for normalization)
routes.post('/admin/flights/create', addFlightHandler);

// Admin update flight
routes.put('/admin/flights/:id', async (req, res) => {
  try {
    const flightId = req.params.id;
    const updateData = req.body.data || req.body;
    if (!updateData) {
      return res.status(400).json({
        isDone: false,
        isError: true,
        success: false,
        msg: 'Update data is required',
      });
    }
    const result = await editFlight(flightId, updateData);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || 'Unable to update flight',
    });
  }
});

// Admin delete flight
routes.delete('/admin/flights/:id', async (req, res) => {
  try {
    const result = await deleteFlight(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || 'Unable to delete flight',
    });
  }
});

// Admin statistics (total bookings, revenue, recent, plus other counts)
routes.get('/admin/stats', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(500).json(getDbError());
    const totalBookings = await FlightBookingModel.countDocuments();
    const revenueAgg = await FlightBookingModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const recentBookings = await FlightBookingModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // additional counts for dashboard cards
    const totalFlights = await FlightModel.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    const totalIssues = await IssueModel.countDocuments();
    const totalContacts = await ContactModel.countDocuments();
    const airlinesList = await FlightModel.distinct('airline');
    const totalAirlines = Array.isArray(airlinesList) ? airlinesList.length : 0;

    return res.json({
      isDone: true,
      isError: false,
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        recentBookings,
        totalFlights,
        totalUsers,
        totalIssues,
        totalContacts,
        totalAirlines,
      },
    });
  } catch (error) {
    return res.status(500).json({
      isDone: false,
      isError: true,
      success: false,
      msg: error.message || 'Unable to fetch stats',
    });
  }
});

module.exports = routes;
