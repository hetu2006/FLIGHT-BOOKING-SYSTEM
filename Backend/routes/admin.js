const express = require("express");
const { authenticateAdminToken } = require("../helpingfunctions/jwt");
const {
  // Flight Management
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
  searchFlights,
  // User Management
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  // Booking Management
  getAllBookings,
  createBooking,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  searchBookings,
  // Issue Management
  getAllIssues,
  createIssue,
  getIssueById,
  updateIssue,
  deleteIssue,
  searchIssues,
  // Contact Management
  getAllContacts,
  updateContact,
  deleteContact,
  searchContacts,
  // Payment Management
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  searchPayments,
} = require("../mongodb/controllers/admincontroller");

const router = express.Router();
const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeFlightPayload = (input = {}) => {
  const source = input.routeSource || input.source;
  const destination = input.routeDestination || input.destination;
  const departureDate = input.departureDate || input.date || new Date().toISOString().split("T")[0];
  const departureTime = input.departureTime || "06:00";
  const arrivalTime = input.arrivalTime || "08:00";
  const totalSeats = toNumber(input.totalSeats, 0);
  const availableSeats = toNumber(input.availableSeats, totalSeats);
  const price = toNumber(input.price, 0);

  return {
    name:
      input.name ||
      [input.airline, input.flightNumber].filter(Boolean).join(" ") ||
      `${source || "City"}-${destination || "City"}`,
    departureDate,
    departureTime,
    returnDate: input.returnDate || departureDate,
    returnTime: input.returnTime || arrivalTime,
    routeSource: source,
    routeDestination: destination,
    flightDuration: input.flightDuration || input.duration || "N/A",
    isEconomyClass:
      typeof input.isEconomyClass === "boolean" ? input.isEconomyClass : true,
    economyClassTicketCost: toNumber(input.economyClassTicketCost, price),
    economyClassTotalSeats: toNumber(input.economyClassTotalSeats, totalSeats),
    economyClassRemainingSeats: toNumber(
      input.economyClassRemainingSeats,
      availableSeats
    ),
    isBusinessClass:
      typeof input.isBusinessClass === "boolean" ? input.isBusinessClass : false,
    businessClassTicketCost: toNumber(input.businessClassTicketCost, 0),
    businessClassTotalSeats: toNumber(input.businessClassTotalSeats, 0),
    businessClassRemainingSeats: toNumber(input.businessClassRemainingSeats, 0),
    isFirstClass:
      typeof input.isFirstClass === "boolean" ? input.isFirstClass : false,
    firstClassTicketCost: toNumber(input.firstClassTicketCost, 0),
    firstClassTotalSeats: toNumber(input.firstClassTotalSeats, 0),
    firstClassRemainingSeats: toNumber(input.firstClassRemainingSeats, 0),
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

// ==================== FLIGHT ENDPOINTS ====================

// Get All Flights (Paginated)
router.post("/flights/list", authenticateAdminToken, async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.body;
  const result = await getAllFlights(page, limit, sortBy, sortOrder);
  res.json(result);
});
// also allow GET with query params for compatibility
router.get("/flights/list", authenticateAdminToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await getAllFlights(page, limit, req.query.sortBy, req.query.sortOrder);
  res.json(result);
});

// Create Flight (alias to existing public /flight/addflight)
router.post("/flights/create", authenticateAdminToken, async (req, res) => {
  // expects flight data in req.body or req.body.data
  const data = normalizeFlightPayload(req.body.data || req.body);
  if (!data.routeSource || !data.routeDestination) {
    return res.json({
      success: false,
      error: "source/routeSource and destination/routeDestination are required",
    });
  }
  const { addFlight } = require("../mongodb/controllers/flightcontroller");
  const result = await addFlight(data);
  res.json(result);
});

// Get Single Flight
router.get("/flights/:id", authenticateAdminToken, async (req, res) => {
  const result = await getFlightById(req.params.id);
  res.json(result);
});

// Update Flight
router.put("/flights/:id", authenticateAdminToken, async (req, res) => {
  const result = await updateFlight(req.params.id, req.body);
  res.json(result);
});

// Delete Flight
router.delete("/flights/:id", authenticateAdminToken, async (req, res) => {
  const result = await deleteFlight(req.params.id);
  res.json(result);
});

// Search Flights
router.post("/flights/search", authenticateAdminToken, async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;

  if (!query) {
    return res.json({ success: false, error: "Search query is required" });
  }

  const result = await searchFlights(query, page, limit);
  res.json(result);
});

// ==================== USER ENDPOINTS ====================

// Get All Users (Paginated)
router.post("/users/list", authenticateAdminToken, async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.body;
  const result = await getAllUsers(page, limit, sortBy, sortOrder);
  res.json(result);
});
// GET version for compatibility
router.get("/users/list", authenticateAdminToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await getAllUsers(page, limit, req.query.sortBy, req.query.sortOrder);
  res.json(result);
});

// Registrations list alias
router.post("/registrations/list", authenticateAdminToken, async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.body;
  const result = await getAllUsers(page, limit, sortBy, sortOrder);
  res.json(result);
});

// Get Single User
router.get("/users/:id", authenticateAdminToken, async (req, res) => {
  const result = await getUserById(req.params.id);
  res.json(result);
});

// Create User
router.post("/users/create", authenticateAdminToken, async (req, res) => {
  const result = await createUser(req.body?.data || req.body);
  res.json(result);
});

// Update User
router.put("/users/:id", authenticateAdminToken, async (req, res) => {
  const result = await updateUser(req.params.id, req.body);
  res.json(result);
});

// Delete User
router.delete("/users/:id", authenticateAdminToken, async (req, res) => {
  const result = await deleteUser(req.params.id);
  res.json(result);
});

// Search Users
router.post("/users/search", authenticateAdminToken, async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;

  if (!query) {
    return res.json({ success: false, error: "Search query is required" });
  }

  const result = await searchUsers(query, page, limit);
  res.json(result);
});

// ==================== BOOKING ENDPOINTS ====================

// Get All Bookings (Paginated)
router.post("/bookings/list", authenticateAdminToken, async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.body;
  const result = await getAllBookings(page, limit, sortBy, sortOrder);
  res.json(result);
});

// Get Single Booking
router.get("/bookings/:id", authenticateAdminToken, async (req, res) => {
  const result = await getBookingById(req.params.id);
  res.json(result);
});

// Create Booking
router.post("/bookings/create", authenticateAdminToken, async (req, res) => {
  const result = await createBooking(req.body?.data || req.body);
  res.json(result);
});

// Update Booking (status, totalPrice, paymentMethod, etc.)
router.put("/bookings/:id", authenticateAdminToken, async (req, res) => {
  console.log(req.params.id, req.body);
  const result = await updateBookingStatus(req.params.id, req.body);
  res.json(result);
});

// Delete Booking
router.delete("/bookings/:id", authenticateAdminToken, async (req, res) => {
  const result = await deleteBooking(req.params.id);
  res.json(result);
});

// Search Bookings
router.post("/bookings/search", authenticateAdminToken, async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;

  if (!query) {
    return res.json({ success: false, error: "Search query is required" });
  }

  const result = await searchBookings(query, page, limit);
  res.json(result);
});

// ==================== ISSUE ENDPOINTS ====================

// Get All Issues (Paginated)
router.post("/issues/list", authenticateAdminToken, async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.body;
  const result = await getAllIssues(page, limit, sortBy, sortOrder);
  res.json(result);
});

// Get Single Issue
router.get("/issues/:id", authenticateAdminToken, async (req, res) => {
  const result = await getIssueById(req.params.id);
  res.json(result);
});

// Create Issue
router.post("/issues/create", authenticateAdminToken, async (req, res) => {
  const result = await createIssue(req.body?.data || req.body);
  res.json(result);
});

// Update Issue
router.put("/issues/:id", authenticateAdminToken, async (req, res) => {
  const result = await updateIssue(req.params.id, req.body);
  res.json(result);
});

// Delete Issue
router.delete("/issues/:id", authenticateAdminToken, async (req, res) => {
  const result = await deleteIssue(req.params.id);
  res.json(result);
});

// Search Issues
router.post("/issues/search", authenticateAdminToken, async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;

  if (!query) {
    return res.json({ success: false, error: "Search query is required" });
  }

  const result = await searchIssues(query, page, limit);
  res.json(result);
});

// ==================== CONTACT ENDPOINTS ====================

router.post("/contacts/list", authenticateAdminToken, async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.body;
  const result = await getAllContacts(page, limit, sortBy, sortOrder);
  res.json(result);
});

router.put("/contacts/:id", authenticateAdminToken, async (req, res) => {
  const result = await updateContact(req.params.id, req.body);
  res.json(result);
});

router.delete("/contacts/:id", authenticateAdminToken, async (req, res) => {
  const result = await deleteContact(req.params.id);
  res.json(result);
});

router.post("/contacts/search", authenticateAdminToken, async (req, res) => {
  const { query, page = 1, limit = 10 } = req.body;
  if (!query) {
    return res.json({ success: false, error: "Search query is required" });
  }
  const result = await searchContacts(query, page, limit);
  res.json(result);
});

const mongoose = require("mongoose");
const FlightBookingModel = require("../mongodb/models/flightbookingmodel");

router.get("/stats", authenticateAdminToken, async (req, res) => {
  try {
    const totalBookings = await FlightBookingModel.countDocuments();
    const revenueAgg = await FlightBookingModel.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const recentBookings = await FlightBookingModel.find().sort({ createdAt: -1 }).limit(5).lean();
    const FlightModel = require("../mongodb/models/flightmodel");
    const UserModel = require("../mongodb/models/usermodel");
    const IssueModel = require("../mongodb/models/issuemodel");
    const ContactModel = require("../mongodb/models/contactmodel");
    const totalFlights = await FlightModel.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    const totalIssues = await IssueModel.countDocuments();
    const totalContacts = await ContactModel.countDocuments();
    res.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        recentBookings,
        totalFlights,
        totalUsers,
        totalIssues,
        totalContacts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/report", authenticateAdminToken, async (req, res) => {
  try {
    const filter = req.query.filter || "month";
    const now = new Date();
    let startDate;
    if (filter === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    const agg = await FlightBookingModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalCost" },
        },
      },
    ]);
    const r = agg[0] || { totalBookings: 0, totalRevenue: 0 };
    res.json({
      success: true,
      data: {
        totalBookings: r.totalBookings,
        totalRevenue: r.totalRevenue,
        profit: r.totalRevenue,
        balance: r.totalRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

router.post("/payments/list", authenticateAdminToken, async (req, res) => {
  try {
    const page = toNumber(req.body.page, 1);
    const limit = toNumber(req.body.limit, 10);
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = req.body.sortOrder || "desc";
    const result = await getAllPayments(page, limit, sortBy, sortOrder);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/payments/list", authenticateAdminToken, async (req, res) => {
  try {
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 10);
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const result = await getAllPayments(page, limit, sortBy, sortOrder);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/payments/:id", authenticateAdminToken, async (req, res) => {
  try {
    const result = await getPaymentById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/payments/:id", authenticateAdminToken, async (req, res) => {
  try {
    const result = await updatePayment(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/payments/:id", authenticateAdminToken, async (req, res) => {
  try {
    const result = await deletePayment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/payments/search", authenticateAdminToken, async (req, res) => {
  try {
    const query = req.body.query || "";
    const page = toNumber(req.body.page, 1);
    const limit = toNumber(req.body.limit, 10);
    const result = await searchPayments(query, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
