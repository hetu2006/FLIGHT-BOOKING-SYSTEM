const mongoose = require("mongoose");
const FlightModel = require("../models/flightmodel");
const UserModel = require("../models/usermodel");
const FlightBookingModel = require("../models/flightbookingmodel");
const IssueModel = require("../models/issuemodel");
const ContactModel = require("../models/contactmodel");
const PaymentModel = require("../models/paymentmodel");
const { encryptPassword } = require("../../helpingfunctions/bcrypt");

const isDbConnected = () => mongoose.connection.readyState === 1;
const dbError = { success: false, error: "Database connection unavailable" };

const toAdminRole = (role) => {
  if (role === "admin" || role === process.env.ADMIN) return "admin";
  return "user";
};

const toStoredRole = (role) => {
  if (!role) return undefined;
  const normalized = String(role).toLowerCase();
  if (normalized === "admin") return process.env.ADMIN || "admin";
  if (normalized === "user") return process.env.USER || "user";
  return role;
};

const toIssueStatusOut = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "open") return "open";
  if (value === "in progress" || value === "in-progress") return "in-progress";
  if (value === "resolved") return "resolved";
  if (value === "closed") return "closed";
  return "open";
};

const toIssueStatusIn = (status) => {
  const out = toIssueStatusOut(status);
  if (out === "open") return "Open";
  if (out === "in-progress") return "In Progress";
  if (out === "resolved") return "Resolved";
  if (out === "closed") return "Closed";
  return "Open";
};

const toBookingStatusOut = (status) => {
  const value = String(status || "").toLowerCase();
  if (["pending", "confirmed", "cancelled", "rejected"].includes(value)) return value;
  if (value === "canceled") return "cancelled";
  return "pending";
};

const toId = (doc) => String(doc?._id || doc?.id || "");

const toSortOrder = (sortOrder) => (String(sortOrder || "").toLowerCase() === "asc" ? 1 : -1);

const buildSort = (sortBy, sortOrder, sortMap, fallback = "createdAt") => {
  const requested = String(sortBy || "").trim();
  const resolved = sortMap[requested] || sortMap[fallback] || fallback;
  return { [resolved]: toSortOrder(sortOrder) };
};

const formatFlight = (flight) => {
  const totalSeats =
    flight.totalSeats ||
    (flight.economyClassTotalSeats || 0) +
      (flight.businessClassTotalSeats || 0) +
      (flight.firstClassTotalSeats || 0);
  const availableSeats =
    flight.availableSeats ||
    (flight.economyClassRemainingSeats || 0) +
      (flight.businessClassRemainingSeats || 0) +
      (flight.firstClassRemainingSeats || 0);

  return {
    ...flight,
    id: toId(flight),
    flightNumber: flight.flightNumber || `FL-${toId(flight).slice(-6).toUpperCase()}`,
    airline: flight.airline || "Airline",
    source: flight.source || flight.routeSource || "",
    destination: flight.destination || flight.routeDestination || "",
    departureTime: flight.departureTime || "",
    arrivalTime: flight.arrivalTime || flight.returnTime || "",
    duration: flight.duration || flight.flightDuration || "",
    price: flight.price || flight.economyClassTicketCost || 0,
    totalSeats,
    availableSeats,
    date: flight.date || flight.departureDate || "",
  };
};

const formatUser = (user) => {
  const safeUser = { ...(user || {}) };
  delete safeUser.password;

  return {
    ...safeUser,
  id: toId(user),
  role: toAdminRole(user.role),
  createdAt:
    user.createdAt ||
    (user._id && user._id.getTimestamp ? user._id.getTimestamp() : new Date()),
  };
};

const formatBooking = (booking, flight) => {
  const passengers =
    booking.passengers ||
    (booking.economyClassTickets || 0) +
      (booking.businessClassTickets || 0) +
      (booking.firstClassTickets || 0);

  return {
    ...booking,
    id: toId(booking),
    status: toBookingStatusOut(booking.status),
    numberOfPassengers: passengers,
    totalPrice: booking.totalPrice || booking.totalCost || 0,
    flightNumber: flight?.flightNumber || flight?.name || "",
    userName: booking.username || "",
    createdAt:
      booking.createdAt ||
      (booking._id && booking._id.getTimestamp ? booking._id.getTimestamp() : new Date()),
  };
};

const formatIssue = (issue) => ({
  ...issue,
  id: toId(issue),
  status: toIssueStatusOut(issue.status),
  issue: issue.issue || issue.description,
  username: issue.username || issue.userName || "",
  email: issue.email || "",
});

const normalizeFlightUpdate = (payload = {}) => {
  const source = payload.source || payload.routeSource;
  const destination = payload.destination || payload.routeDestination;

  const update = {
    ...payload,
    source: source || "",
    destination: destination || "",
    routeSource: source || payload.routeSource,
    routeDestination: destination || payload.routeDestination,
  };

  if (!update.name) {
    update.name = [update.airline, update.flightNumber].filter(Boolean).join(" ") || "Flight";
  }

  if (!update.departureDate) {
    update.departureDate = update.date || new Date().toISOString().split("T")[0];
  }

  if (!update.returnDate) {
    update.returnDate = update.departureDate;
  }

  if (!update.departureTime) {
    update.departureTime = new Date().toISOString();
  }

  if (!update.returnTime) {
    update.returnTime = update.arrivalTime || update.departureTime;
  }

  if (!update.flightDuration) {
    update.flightDuration = update.duration || "";
  }

  const price = Number(update.price || update.economyClassTicketCost || 0);
  const totalSeats = Number(update.totalSeats || update.economyClassTotalSeats || 0);
  const availableSeats = Number(update.availableSeats || update.economyClassRemainingSeats || totalSeats);

  update.price = Number.isFinite(price) ? price : 0;
  update.totalSeats = Number.isFinite(totalSeats) ? totalSeats : 0;
  update.availableSeats = Number.isFinite(availableSeats) ? availableSeats : 0;

  if (typeof update.isEconomyClass !== "boolean") update.isEconomyClass = true;
  if (typeof update.isBusinessClass !== "boolean") update.isBusinessClass = false;
  if (typeof update.isFirstClass !== "boolean") update.isFirstClass = false;

  if (update.isEconomyClass) {
    if (!update.economyClassTicketCost) update.economyClassTicketCost = update.price;
    if (!update.economyClassTotalSeats) update.economyClassTotalSeats = update.totalSeats;
    if (!update.economyClassRemainingSeats) update.economyClassRemainingSeats = update.availableSeats;
  }

  return update;
};

const generateBookingId = () => `BK${Date.now()}`;

const resolveUserByIdentifier = async (identifier) => {
  const value = String(identifier || "").trim();
  if (!value) return null;

  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await UserModel.findById(value);
    if (byId) return byId;
  }

  const lowered = value.toLowerCase();
  return UserModel.findOne({
    $or: [{ username: value }, { email: lowered }, { name: value }],
  });
};

const resolveFlightByIdentifier = async (identifier) => {
  const value = String(identifier || "").trim();
  if (!value) return null;

  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await FlightModel.findById(value);
    if (byId) return byId;
  }

  return FlightModel.findOne({
    $or: [{ flightNumber: value }, { name: value }],
  });
};

// ==================== FLIGHT MANAGEMENT ====================

const getAllFlights = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const sort = buildSort(
      sortBy,
      sortOrder,
      {
        createdAt: "createdAt",
        flightNumber: "flightNumber",
        airline: "airline",
        source: "source",
        destination: "destination",
        departureTime: "departureTime",
        arrivalTime: "arrivalTime",
        price: "price",
        availableSeats: "availableSeats",
        totalSeats: "totalSeats",
        date: "date",
      },
      "createdAt"
    );
    const flights = await FlightModel.find({})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FlightModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: flights.map(formatFlight),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getFlightById = async (flightId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      return { success: false, error: "Invalid flight ID" };
    }

    const flight = await FlightModel.findById(flightId).lean();
    if (!flight) {
      return { success: false, error: "Flight not found" };
    }

    return { success: true, data: formatFlight(flight) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const updateFlight = async (flightId, updateData) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!flightId) return { success: false, error: "Flight ID is required" };
    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      return { success: false, error: "Invalid flight ID" };
    }

    const payload = normalizeFlightUpdate(updateData || {});
    const result = await FlightModel.findByIdAndUpdate(flightId, payload, { new: true });
    if (!result) return { success: false, error: "Flight not found" };

    return { success: true, data: { modifiedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deleteFlight = async (flightId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!flightId) return { success: false, error: "Flight ID is required" };
    if (!mongoose.Types.ObjectId.isValid(flightId)) {
      return { success: false, error: "Invalid flight ID" };
    }

    const result = await FlightModel.findByIdAndDelete(flightId);
    if (!result) return { success: false, error: "Flight not found" };

    return { success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const searchFlights = async (query, page = 1, limit = 10) => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [
        { name: searchRegex },
        { flightNumber: searchRegex },
        { airline: searchRegex },
        { source: searchRegex },
        { destination: searchRegex },
        { routeSource: searchRegex },
        { routeDestination: searchRegex },
      ],
    };

    const flights = await FlightModel.find(filter).skip(skip).limit(limit).lean();
    const total = await FlightModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: flights.map(formatFlight),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==================== USER MANAGEMENT ====================

const getAllUsers = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const sort = buildSort(
      sortBy,
      sortOrder,
      {
        createdAt: "createdAt",
        username: "username",
        name: "name",
        email: "email",
        phoneNo: "phoneNo",
        role: "role",
      },
      "createdAt"
    );
    const users = await UserModel.find({})
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: users.map(formatUser),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getUserById = async (userId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user ID" };
    }

    const user = await UserModel.findById(userId).select("-password").lean();
    if (!user) return { success: false, error: "User not found" };

    return { success: true, data: formatUser(user) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const updateUser = async (userId, updateData) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!userId) return { success: false, error: "User ID is required" };
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user ID" };
    }

    const payload = { ...(updateData || {}) };
    delete payload.password;
    if (payload.role) payload.role = toStoredRole(payload.role);

    const result = await UserModel.findByIdAndUpdate(userId, payload, { new: true });
    if (!result) return { success: false, error: "User not found" };

    return { success: true, data: { modifiedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deleteUser = async (userId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!userId) return { success: false, error: "User ID is required" };
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user ID" };
    }

    const result = await UserModel.findByIdAndDelete(userId);
    if (!result) return { success: false, error: "User not found" };

    await FlightBookingModel.deleteMany({ userId: String(userId) });

    return { success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { name: searchRegex },
        { phoneNo: searchRegex },
      ],
    };

    const users = await UserModel.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: users.map(formatUser),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const createUser = async (userData) => {
  try {
    if (!isDbConnected()) return dbError;

    const payload = { ...(userData || {}) };
    const email = String(payload.email || "").toLowerCase().trim();
    const username = String(payload.username || (email ? email.split("@")[0] : "")).trim();
    const password = String(payload.password || "").trim();

    if (!payload.name || !email || !username || !password) {
      return { success: false, error: "name, email, username and password are required" };
    }

    const existingByEmail = await UserModel.findOne({ email });
    if (existingByEmail) return { success: false, error: "Email already exists" };

    const existingByUsername = await UserModel.findOne({ username });
    if (existingByUsername) return { success: false, error: "Username already exists" };

    const encrypted = await encryptPassword(password);
    if (encrypted.isError) return { success: false, error: "Unable to hash password" };

    const doc = await UserModel.create({
      name: payload.name,
      username,
      email,
      phoneNo: payload.phoneNo || "",
      address: payload.address || "",
      role: toStoredRole(payload.role || "user"),
      password: encrypted.hashedPassword,
    });

    return { success: true, data: formatUser(doc.toObject()) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==================== BOOKING MANAGEMENT ====================

const createBooking = async (bookingData) => {
  try {
    if (!isDbConnected()) return dbError;

    const payload = bookingData || {};
    const userIdentifier = payload.userIdentifier || payload.userId || payload.username || payload.email;
    const flightIdentifier = payload.flightIdentifier || payload.flightId || payload.flightNumber;

    const user = await resolveUserByIdentifier(userIdentifier);
    if (!user) return { success: false, error: "User not found for userIdentifier/userId" };

    const flight = await resolveFlightByIdentifier(flightIdentifier);
    if (!flight) return { success: false, error: "Flight not found for flightIdentifier/flightId" };

    const passengers = Math.max(1, Number(payload.numberOfPassengers || payload.passengers || 1));
    const classType = String(payload.classType || "economy").toLowerCase();

    const isEconomyClass = classType === "economy";
    const isBusinessClass = classType === "business";
    const isFirstClass = classType === "first";

    const economyTickets = isEconomyClass ? passengers : 0;
    const businessTickets = isBusinessClass ? passengers : 0;
    const firstTickets = isFirstClass ? passengers : 0;

    const economyCost = economyTickets * Number(flight.economyClassTicketCost || flight.price || 0);
    const businessCost = businessTickets * Number(flight.businessClassTicketCost || flight.price || 0);
    const firstCost = firstTickets * Number(flight.firstClassTicketCost || flight.price || 0);

    let totalCost = economyCost + businessCost + firstCost;
    if (typeof payload.totalPrice !== "undefined") {
      const manualTotal = Number(payload.totalPrice);
      if (Number.isFinite(manualTotal) && manualTotal > 0) {
        totalCost = manualTotal;
      }
    }

    const doc = await FlightBookingModel.create({
      bookingId: payload.bookingId || generateBookingId(),
      flightId: String(flight._id),
      userId: String(user._id),
      username: user.username,
      passengers,
      passengerDetails: Array.isArray(payload.passengerDetails) ? payload.passengerDetails : [],
      isEconomyClass,
      economyClassTickets: economyTickets,
      economyClassTicketCost: isEconomyClass ? totalCost : economyCost,
      isBusinessClass,
      businessClassTickets: businessTickets,
      businessClassTicketCost: isBusinessClass ? totalCost : businessCost,
      isFirstClass,
      firstClassTickets: firstTickets,
      firstClassTicketCost: isFirstClass ? totalCost : firstCost,
      totalCost,
      totalPrice: totalCost,
      status: toBookingStatusIn(payload.status || "pending"),
      flightDate: payload.flightDate || flight.departureDate || flight.date || "",
      tickets: Array.isArray(payload.tickets) ? payload.tickets : [],
    });

    return { success: true, data: formatBooking(doc.toObject(), flight.toObject()) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getAllBookings = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const sort = buildSort(
      sortBy,
      sortOrder,
      {
        createdAt: "createdAt",
        bookingId: "bookingId",
        username: "username",
        flightId: "flightId",
        status: "status",
        passengers: "passengers",
        totalPrice: "totalPrice",
        totalCost: "totalCost",
      },
      "createdAt"
    );
    const bookings = await FlightBookingModel.find({})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const flightIds = bookings
      .map((b) => b.flightId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const flights = await FlightModel.find({ _id: { $in: flightIds } }).lean();
    const flightMap = new Map(flights.map((f) => [toId(f), f]));

    const enrichedBookings = [];
    for (const booking of bookings) {
      const maybeCompleted = await autoCompleteIfExpired(booking);
      enrichedBookings.push(formatBooking(maybeCompleted, flightMap.get(String(booking.flightId))));
    }

    const total = await FlightBookingModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: enrichedBookings,
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getBookingById = async (bookingId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return { success: false, error: "Invalid booking ID" };
    }

    const booking = await FlightBookingModel.findById(bookingId).lean();
    if (!booking) return { success: false, error: "Booking not found" };

    let flight = null;
    if (mongoose.Types.ObjectId.isValid(booking.flightId)) {
      flight = await FlightModel.findById(booking.flightId).lean();
    }

    return { success: true, data: formatBooking(booking, flight) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const resolveSeatCount = (booking) => {
  if (!booking) return 0;
  const econ = Number(booking.economyClassTickets || 0);
  const bus = Number(booking.businessClassTickets || 0);
  const first = Number(booking.firstClassTickets || 0);
  if (booking.passengers && Number.isFinite(Number(booking.passengers)) && Number(booking.passengers) > 0) {
    return Number(booking.passengers);
  }
  return econ + bus + first;
};

const toBookingStatusIn = (status) => {
  const value = String(status || "").toLowerCase().trim();
  if (value === "confirmed") return "confirmed";
  if (value === "cancelled" || value === "canceled") return "cancelled";
  if (value === "rejected") return "rejected";
  if (value === "completed") return "completed";
  return "pending";
};

const autoCompleteIfExpired = async (booking) => {
  if (!booking || !booking.flightDate || booking.status !== "confirmed") return booking;
  const flightDate = new Date(booking.flightDate);
  const now = new Date();
  if (flightDate < now) {
    booking.status = "completed";
    await FlightBookingModel.findByIdAndUpdate(booking._id || booking.id, { status: "completed" });
  }
  return booking;
};

const updateBookingStatus = async (bookingId, payload) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!bookingId) return { success: false, error: "Booking ID is required" };
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return { success: false, error: "Invalid booking ID" };
    }

    const booking = await FlightBookingModel.findById(bookingId).lean();
    if (!booking) return { success: false, error: "Booking not found" };

    const updateDoc = {};
    const targetStatus = payload?.status ? toBookingStatusIn(payload.status) : booking.status;

    // Admin confirm/cancel flow
    if (targetStatus === "confirmed") {
      if (String(booking.paymentStatus || "").toLowerCase() !== "paid" && !payload.paymentStatus) {
        return { success: false, error: "Cannot confirm booking. Payment status must be paid." };
      }

      const flight = await FlightModel.findById(booking.flightId).lean();
      if (!flight) return { success: false, error: "Linked flight not found" };

      const neededSeats = resolveSeatCount(booking);
      if (Number(flight.availableSeats || 0) < neededSeats) {
        return { success: false, error: "Not enough seats available to confirm this booking" };
      }

      updateDoc.status = "confirmed";
      updateDoc.paymentStatus = payload.paymentStatus || booking.paymentStatus || "paid";
      await FlightModel.findByIdAndUpdate(flight._id, {
        availableSeats: Math.max(0, Number(flight.availableSeats || 0) - neededSeats),
      });
    } else if (targetStatus === "cancelled" || targetStatus === "rejected") {
      if (booking.status === "confirmed") {
        const flight = await FlightModel.findById(booking.flightId).lean();
        const seats = resolveSeatCount(booking);
        if (flight) {
          await FlightModel.findByIdAndUpdate(flight._id, {
            availableSeats: Number(flight.availableSeats || 0) + seats,
          });
        }
      }
      updateDoc.status = targetStatus;
    } else if (targetStatus === "completed") {
      updateDoc.status = "completed";
    }

    if (typeof payload.totalPrice !== "undefined") {
      const total = Number(payload.totalPrice) || 0;
      updateDoc.totalPrice = total;
      updateDoc.totalCost = total;
    }
    if (typeof payload.paymentMethod !== "undefined") updateDoc.paymentMethod = String(payload.paymentMethod);
    if (typeof payload.paymentStatus !== "undefined") updateDoc.paymentStatus = String(payload.paymentStatus);
    if (typeof payload.transactionId !== "undefined") updateDoc.transactionId = String(payload.transactionId);
    if (typeof payload.numberOfPassengers !== "undefined") updateDoc.passengers = Number(payload.numberOfPassengers) || 0;

    if (Object.keys(updateDoc).length === 0) {
      return { success: false, error: "At least one field is required" };
    }

    await FlightBookingModel.findByIdAndUpdate(bookingId, updateDoc, { new: true });
    return { success: true, data: { modifiedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deleteBooking = async (bookingId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!bookingId) return { success: false, error: "Booking ID is required" };
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return { success: false, error: "Invalid booking ID" };
    }

    const result = await FlightBookingModel.findByIdAndDelete(bookingId);
    if (!result) return { success: false, error: "Booking not found" };

    return { success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const searchBookings = async (query, page = 1, limit = 10) => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [{ username: searchRegex }, { bookingId: searchRegex }, { flightId: searchRegex }],
    };

    if (mongoose.Types.ObjectId.isValid(query)) {
      filter.$or.push({ _id: query });
    }

    const bookings = await FlightBookingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const flightIds = bookings
      .map((b) => b.flightId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const flights = await FlightModel.find({ _id: { $in: flightIds } }).lean();
    const flightMap = new Map(flights.map((f) => [toId(f), f]));

    const enriched = [];
    for (const booking of bookings) {
      const maybeCompleted = await autoCompleteIfExpired(booking);
      enriched.push(formatBooking(maybeCompleted, flightMap.get(String(booking.flightId))));
    }

    const total = await FlightBookingModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: enriched,
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==================== ISSUE MANAGEMENT ====================

const createIssue = async (issueData) => {
  try {
    if (!isDbConnected()) return dbError;

    const payload = issueData || {};
    const userIdentifier = payload.userIdentifier || payload.userId || payload.username || payload.email;
    const user = await resolveUserByIdentifier(userIdentifier);

    if (!user) {
      return { success: false, error: "User not found for userIdentifier/userId" };
    }

    if (!payload.subject || !payload.description) {
      return { success: false, error: "subject and description are required" };
    }

    const doc = await IssueModel.create({
      userId: user._id,
      userName: user.name,
      username: user.username,
      email: user.email,
      subject: payload.subject,
      description: payload.description,
      issueType: payload.issueType || "General",
      issue: payload.issue || payload.description,
      status: toIssueStatusIn(payload.status || "open"),
      resolution: payload.resolution || "",
    });

    return { success: true, data: formatIssue(doc.toObject()) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getAllIssues = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const sort = buildSort(
      sortBy,
      sortOrder,
      {
        createdAt: "createdAt",
        subject: "subject",
        userName: "userName",
        username: "username",
        status: "status",
      },
      "createdAt"
    );

    const issues = await IssueModel.find({})
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    const total = await IssueModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: issues.map(formatIssue),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getIssueById = async (issueId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return { success: false, error: "Invalid issue ID" };
    }

    const issue = await IssueModel.findById(issueId).lean();
    if (!issue) return { success: false, error: "Issue not found" };

    return { success: true, data: formatIssue(issue) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const updateIssue = async (issueId, updateData) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!issueId) return { success: false, error: "Issue ID is required" };
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return { success: false, error: "Invalid issue ID" };
    }

    const payload = { ...(updateData || {}) };
    if (payload.status) {
      payload.status = toIssueStatusIn(payload.status);
    }

    const result = await IssueModel.findByIdAndUpdate(issueId, payload, { new: true });
    if (!result) return { success: false, error: "Issue not found" };

    return { success: true, data: { modifiedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deleteIssue = async (issueId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!issueId) return { success: false, error: "Issue ID is required" };
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return { success: false, error: "Invalid issue ID" };
    }

    const result = await IssueModel.findByIdAndDelete(issueId);
    if (!result) return { success: false, error: "Issue not found" };

    return { success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const searchIssues = async (query, page = 1, limit = 10) => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [
        { subject: searchRegex },
        { userName: searchRegex },
        { username: searchRegex },
        { description: searchRegex },
        { status: searchRegex },
      ],
    };

    if (mongoose.Types.ObjectId.isValid(query)) {
      filter.$or.push({ _id: query });
    }

    const issues = await IssueModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await IssueModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: issues.map(formatIssue),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==================== CONTACT MANAGEMENT ====================

const formatContact = (contact) => ({
  ...contact,
  id: toId(contact),
});

const formatPayment = (payment, booking = null, user = null) => {
  const className = booking?.economyClassTickets > 0 ? "Economy" : booking?.businessClassTickets > 0 ? "Business" : booking?.firstClassTickets > 0 ? "First" : "";
  const firstTicket = Array.isArray(booking?.tickets) && booking.tickets.length > 0 ? booking.tickets[0] : null;
  const passengerCount = booking?.passengers || booking?.economyClassTickets || booking?.businessClassTickets || booking?.firstClassTickets || 0;

  return {
    ...payment,
    id: toId(payment),
    userName:
      user?.name ||
      user?.username ||
      payment.userName ||
      payment.cardHolderName ||
      payment.custName ||
      "",
    userEmail: user?.email || payment.userEmail || "",
    bookingId: payment.bookingId || "",
    flightId: payment.flightId || "",
    passengerCount,
    passengerClass: className,
    ticketNo: firstTicket?.ticketNo || "",
    amount: Number(payment.amount || 0),
    currency: payment.currency || "INR",
    status: payment.status || "pending",
    paymentMethod: payment.paymentMethod || "",
    transactionId: payment.transactionId || "",
    gateway: payment.paymentGateway || payment.gatewayResponse?.gateway || "",
    paidAt: payment.paidAt || payment.createdAt,
  };
};

const createContact = async (payload = {}) => {
  try {
    if (!isDbConnected()) return dbError;

    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").toLowerCase().trim();
    const subject = String(payload.subject || "").trim();
    const message = String(payload.message || "").trim();

    if (!name || !email || !subject || !message) {
      return { success: false, error: "name, email, subject and message are required" };
    }

    const doc = await ContactModel.create({
      name,
      email,
      phoneNo: String(payload.phoneNo || "").trim(),
      subject,
      message,
      status: String(payload.status || "new").toLowerCase(),
      reply: String(payload.reply || "").trim(),
    });

    return { success: true, data: formatContact(doc.toObject()) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getAllContacts = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const sort = buildSort(
      sortBy,
      sortOrder,
      {
        createdAt: "createdAt",
        name: "name",
        email: "email",
        subject: "subject",
        status: "status",
      },
      "createdAt"
    );

    const contacts = await ContactModel.find({})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ContactModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: contacts.map(formatContact),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const updateContact = async (contactId, payload = {}) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
      return { success: false, error: "Invalid contact ID" };
    }

    const updateDoc = {};
    if (typeof payload.status !== "undefined") updateDoc.status = String(payload.status).toLowerCase();
    if (typeof payload.reply !== "undefined") updateDoc.reply = String(payload.reply);

    if (Object.keys(updateDoc).length === 0) {
      return { success: false, error: "No update fields provided" };
    }

    const doc = await ContactModel.findByIdAndUpdate(contactId, updateDoc, { new: true }).lean();
    if (!doc) return { success: false, error: "Contact not found" };
    return { success: true, data: formatContact(doc) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deleteContact = async (contactId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!contactId || !mongoose.Types.ObjectId.isValid(contactId)) {
      return { success: false, error: "Invalid contact ID" };
    }

    const result = await ContactModel.findByIdAndDelete(contactId);
    if (!result) return { success: false, error: "Contact not found" };
    return { success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const searchContacts = async (query, page = 1, limit = 10) => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [{ name: searchRegex }, { email: searchRegex }, { subject: searchRegex }, { message: searchRegex }, { status: searchRegex }],
    };

    const contacts = await ContactModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ContactModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: contacts.map(formatContact),
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==================== PAYMENT MANAGEMENT ====================

const getAllPayments = async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const sort = buildSort(
      sortBy,
      sortOrder,
      {
        createdAt: "createdAt",
        amount: "amount",
        status: "status",
        paymentMethod: "paymentMethod",
        transactionId: "transactionId",
        userId: "userId",
        bookingId: "bookingId",
      },
      "createdAt"
    );

    const payments = await PaymentModel.find({})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = payments.map((p) => String(p.userId)).filter(Boolean);
    const bookingIds = payments.map((p) => String(p.bookingId)).filter(Boolean);

    const [users, bookings] = await Promise.all([
      UserModel.find({ _id: { $in: userIds } }).lean(),
      FlightBookingModel.find({ bookingId: { $in: bookingIds } }).lean(),
    ]);

    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const bookingMap = new Map(bookings.map((b) => [String(b.bookingId), b]));

    const enriched = payments.map((p) => {
      const user = userMap.get(String(p.userId)) || null;
      const booking = bookingMap.get(String(p.bookingId)) || null;
      return formatPayment(p, booking, user);
    });

    const total = await PaymentModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: enriched,
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getPaymentById = async (paymentId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return { success: false, error: "Invalid payment ID" };
    }

    const payment = await PaymentModel.findById(paymentId).lean();
    if (!payment) return { success: false, error: "Payment not found" };

    const user = payment.userId ? await UserModel.findById(payment.userId).lean() : null;
    const booking = payment.bookingId ? await FlightBookingModel.findOne({ bookingId: payment.bookingId }).lean() : null;

    return { success: true, data: formatPayment(payment, booking, user) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const updatePayment = async (paymentId, updateData) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!paymentId) return { success: false, error: "Payment ID is required" };
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return { success: false, error: "Invalid payment ID" };
    }

    const payload = { ...(updateData || {}) };
    if (payload.amount) payload.amount = Number(payload.amount) || 0;
    if (payload.status) payload.status = String(payload.status).toLowerCase();

    const result = await PaymentModel.findByIdAndUpdate(paymentId, payload, { new: true });
    if (!result) return { success: false, error: "Payment not found" };

    return { success: true, data: { modifiedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deletePayment = async (paymentId) => {
  try {
    if (!isDbConnected()) return dbError;
    if (!paymentId) return { success: false, error: "Payment ID is required" };
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return { success: false, error: "Invalid payment ID" };
    }

    const result = await PaymentModel.findByIdAndDelete(paymentId);
    if (!result) return { success: false, error: "Payment not found" };

    return { success: true, data: { deletedCount: 1 } };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const searchPayments = async (query, page = 1, limit = 10) => {
  try {
    if (!isDbConnected()) return dbError;

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [
        { transactionId: searchRegex },
        { paymentMethod: searchRegex },
        { status: searchRegex },
        { userId: searchRegex },
        { bookingId: searchRegex },
        { flightId: searchRegex },
      ],
    };

    if (mongoose.Types.ObjectId.isValid(query)) {
      filter.$or.push({ _id: query });
    }

    const payments = await PaymentModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = payments.map((p) => String(p.userId)).filter(Boolean);
    const bookingIds = payments.map((p) => String(p.bookingId)).filter(Boolean);

    const [users, bookings] = await Promise.all([
      UserModel.find({ _id: { $in: userIds } }).lean(),
      FlightBookingModel.find({ bookingId: { $in: bookingIds } }).lean(),
    ]);

    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const bookingMap = new Map(bookings.map((b) => [String(b.bookingId), b]));

    const enriched = payments.map((p) => {
      const user = userMap.get(String(p.userId)) || null;
      const booking = bookingMap.get(String(p.bookingId)) || null;
      return formatPayment(p, booking, user);
    });

    const total = await PaymentModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: enriched,
      total,
      page,
      pages: totalPages,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
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
  createContact,
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
};
