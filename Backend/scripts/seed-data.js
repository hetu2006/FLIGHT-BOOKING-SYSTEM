/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const UserModel = require("../mongodb/models/usermodel");
const FlightModel = require("../mongodb/models/flightmodel");
const FlightBookingModel = require("../mongodb/models/flightbookingmodel");
const IssueModel = require("../mongodb/models/issuemodel");
const PaymentModel = require("../mongodb/models/paymentmodel");
const { encryptPassword } = require("../helpingfunctions/bcrypt");

const args = process.argv.slice(2);
const shouldReset = args.includes("--reset");
const fileArgIndex = args.findIndex((a) => a === "--file");
const customFile = fileArgIndex >= 0 ? args[fileArgIndex + 1] : "";

const seedFilePath = customFile
  ? path.resolve(process.cwd(), customFile)
  : path.resolve(__dirname, "../seed/sample-data.json");

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeRole = (role) => {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "admin") return process.env.ADMIN || "admin";
  if (normalized === "user") return process.env.USER || "user";
  return role || process.env.USER || "user";
};

const normalizeIssueStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "open") return "Open";
  if (value === "in-progress" || value === "in progress") return "In Progress";
  if (value === "resolved") return "Resolved";
  if (value === "closed") return "Closed";
  return "Open";
};

const normalizeFlight = (flight = {}) => {
  const source = flight.routeSource || flight.source;
  const destination = flight.routeDestination || flight.destination;

  const totalSeats =
    toNumber(flight.totalSeats, 0) ||
    toNumber(flight.economyClassTotalSeats, 0) +
      toNumber(flight.businessClassTotalSeats, 0) +
      toNumber(flight.firstClassTotalSeats, 0);

  const availableSeats =
    toNumber(flight.availableSeats, 0) ||
    toNumber(flight.economyClassRemainingSeats, 0) +
      toNumber(flight.businessClassRemainingSeats, 0) +
      toNumber(flight.firstClassRemainingSeats, 0) ||
    totalSeats;

  const basePrice = toNumber(flight.price, 0) || toNumber(flight.economyClassTicketCost, 0);

  return {
    alias: flight.alias,
    flightNumber: flight.flightNumber || "",
    airline: flight.airline || "",
    source: source || "",
    destination: destination || "",
    name:
      flight.name ||
      [flight.airline, flight.flightNumber].filter(Boolean).join(" ") ||
      `${source || "City"}-${destination || "City"}`,

    departureDate: flight.departureDate || flight.date,
    departureTime: flight.departureTime || "06:00",
    returnDate: flight.returnDate || flight.departureDate || flight.date,
    returnTime: flight.returnTime || flight.arrivalTime || flight.departureTime || "08:00",
    arrivalTime: flight.arrivalTime || flight.returnTime || "08:00",
    date: flight.date || flight.departureDate,

    routeSource: source,
    routeDestination: destination,
    flightDuration: flight.flightDuration || flight.duration || "2h 30m",
    duration: flight.duration || flight.flightDuration || "2h 30m",

    isEconomyClass:
      typeof flight.isEconomyClass === "boolean" ? flight.isEconomyClass : true,
    economyClassTicketCost: toNumber(flight.economyClassTicketCost, basePrice),
    economyClassTotalSeats: toNumber(flight.economyClassTotalSeats, totalSeats),
    economyClassRemainingSeats: toNumber(
      flight.economyClassRemainingSeats,
      toNumber(flight.economyClassTotalSeats, totalSeats)
    ),

    isBusinessClass:
      typeof flight.isBusinessClass === "boolean" ? flight.isBusinessClass : true,
    businessClassTicketCost: toNumber(flight.businessClassTicketCost, basePrice * 1.8),
    businessClassTotalSeats: toNumber(flight.businessClassTotalSeats, 30),
    businessClassRemainingSeats: toNumber(
      flight.businessClassRemainingSeats,
      toNumber(flight.businessClassTotalSeats, 30)
    ),

    isFirstClass:
      typeof flight.isFirstClass === "boolean" ? flight.isFirstClass : false,
    firstClassTicketCost: toNumber(flight.firstClassTicketCost, basePrice * 2.5),
    firstClassTotalSeats: toNumber(flight.firstClassTotalSeats, 10),
    firstClassRemainingSeats: toNumber(
      flight.firstClassRemainingSeats,
      toNumber(flight.firstClassTotalSeats, 10)
    ),

    price: basePrice,
    totalSeats,
    availableSeats,
  };
};

const buildTickets = (bookingId, className, count) => {
  const tickets = [];
  for (let i = 1; i <= count; i += 1) {
    tickets.push({ className, ticketNo: `${bookingId}--${className}-${i}` });
  }
  return tickets;
};

const run = async () => {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    throw new Error("MONGODB_URL/MONGODB_URI missing in .env");
  }

  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Seed file not found: ${seedFilePath}`);
  }

  const raw = fs.readFileSync(seedFilePath, "utf8");
  const seed = JSON.parse(raw);

  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });

  if (shouldReset) {
    console.log("Reset mode enabled. Clearing collections...");
    await Promise.all([
      UserModel.deleteMany({}),
      FlightModel.deleteMany({}),
      FlightBookingModel.deleteMany({}),
      IssueModel.deleteMany({}),
      PaymentModel.deleteMany({}),
    ]);
  }

  const userMap = new Map();
  const flightMap = new Map();

  const users = Array.isArray(seed.users) ? seed.users : [];
  for (const user of users) {
    const email = String(user.email || "").toLowerCase().trim();
    const username = user.username || (email ? email.split("@")[0] : "");
    if (!email || !username || !user.password || !user.name) {
      console.warn("Skipping invalid user entry:", user);
      continue;
    }

    const encrypted = await encryptPassword(user.password);
    if (encrypted.isError) {
      console.warn("Failed to hash password for user:", email);
      continue;
    }

    const payload = {
      name: user.name,
      username,
      email,
      phoneNo: user.phoneNo || "",
      address: user.address || "",
      role: normalizeRole(user.role),
      password: encrypted.hashedPassword,
    };

    const doc = await UserModel.findOneAndUpdate(
      { email },
      { $set: payload },
      { new: true, upsert: true }
    );

    if (user.alias) userMap.set(user.alias, doc);
    userMap.set(email, doc);
    userMap.set(username, doc);
  }

  const flights = Array.isArray(seed.flights) ? seed.flights : [];
  for (const flight of flights) {
    const normalized = normalizeFlight(flight);

    if (!normalized.routeSource || !normalized.routeDestination || !normalized.departureDate) {
      console.warn("Skipping invalid flight entry:", flight);
      continue;
    }

    const findFilter = {
      flightNumber: normalized.flightNumber,
      departureDate: normalized.departureDate,
      routeSource: normalized.routeSource,
      routeDestination: normalized.routeDestination,
    };

    const doc = await FlightModel.findOneAndUpdate(
      findFilter,
      { $set: normalized },
      { new: true, upsert: true }
    );

    if (normalized.alias) flightMap.set(normalized.alias, doc);
    if (normalized.flightNumber) flightMap.set(normalized.flightNumber, doc);
  }

  const bookings = Array.isArray(seed.bookings) ? seed.bookings : [];
  for (let idx = 0; idx < bookings.length; idx += 1) {
    const booking = bookings[idx];
    const userRef =
      userMap.get(booking.userAlias) ||
      userMap.get(String(booking.userEmail || "").toLowerCase()) ||
      userMap.get(booking.username);

    const flightRef =
      flightMap.get(booking.flightAlias) ||
      flightMap.get(booking.flightNumber);

    if (!userRef || !flightRef) {
      console.warn("Skipping booking due to missing user/flight reference:", booking);
      continue;
    }

    const passengers = toNumber(booking.passengers, 1);
    const bookingId = booking.bookingId || `BK${Date.now()}${idx}`;

    const className = String(booking.class || "economy").toLowerCase();
    const isEconomyClass = className === "economy";
    const isBusinessClass = className === "business";
    const isFirstClass = className === "first";

    const economyTickets = isEconomyClass ? passengers : 0;
    const businessTickets = isBusinessClass ? passengers : 0;
    const firstTickets = isFirstClass ? passengers : 0;

    const economyCost = economyTickets * toNumber(flightRef.economyClassTicketCost, flightRef.price || 0);
    const businessCost = businessTickets * toNumber(flightRef.businessClassTicketCost, 0);
    const firstCost = firstTickets * toNumber(flightRef.firstClassTicketCost, 0);

    const totalCost = economyCost + businessCost + firstCost;

    const tickets = [
      ...buildTickets(bookingId, "Economy", economyTickets),
      ...buildTickets(bookingId, "Business", businessTickets),
      ...buildTickets(bookingId, "First", firstTickets),
    ];

    const payload = {
      bookingId,
      flightId: String(flightRef._id),
      userId: String(userRef._id),
      username: userRef.username,
      passengers,
      passengerDetails: booking.passengerDetails || [],
      isEconomyClass,
      economyClassTickets: economyTickets,
      economyClassTicketCost: economyCost,
      isBusinessClass,
      businessClassTickets: businessTickets,
      businessClassTicketCost: businessCost,
      isFirstClass,
      firstClassTickets: firstTickets,
      firstClassTicketCost: firstCost,
      totalCost,
      totalPrice: totalCost,
      status: String(booking.status || "pending").toLowerCase(),
      flightDate: booking.flightDate || flightRef.departureDate,
      tickets,
      createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
    };

    await FlightBookingModel.findOneAndUpdate(
      { bookingId },
      { $set: payload },
      { upsert: true, new: true }
    );
  }

  const issues = Array.isArray(seed.issues) ? seed.issues : [];
  for (const issue of issues) {
    const userRef =
      userMap.get(issue.userAlias) ||
      userMap.get(String(issue.userEmail || "").toLowerCase()) ||
      userMap.get(issue.username);

    if (!userRef) {
      console.warn("Skipping issue due to missing user reference:", issue);
      continue;
    }

    const subject = issue.subject || "General Support";
    const description = issue.description || issue.issue || "Issue reported";

    const payload = {
      userId: userRef._id,
      userName: userRef.name,
      username: userRef.username,
      email: userRef.email,
      subject,
      description,
      issueType: issue.issueType || "General",
      issue: issue.issue || description,
      status: normalizeIssueStatus(issue.status),
      resolution: issue.resolution || "",
      createdAt: issue.createdAt ? new Date(issue.createdAt) : new Date(),
    };

    await IssueModel.findOneAndUpdate(
      { userId: userRef._id, subject, description },
      { $set: payload },
      { upsert: true, new: true }
    );
  }

  const payments = Array.isArray(seed.payments) ? seed.payments : [];
  for (let idx = 0; idx < payments.length; idx += 1) {
    const payment = payments[idx];
    const userRef =
      userMap.get(payment.userAlias) ||
      userMap.get(String(payment.userEmail || "").toLowerCase()) ||
      userMap.get(payment.username);

    const bookingRef = payment.bookingId ? await FlightBookingModel.findOne({ bookingId: payment.bookingId }) : null;

    if (!userRef) {
      console.warn("Skipping payment due to missing user reference:", payment);
      continue;
    }

    const transactionId = payment.transactionId || `TXN${Date.now()}${idx}`;
    const amount = toNumber(payment.amount, 0);
    const currency = payment.currency || "INR";

    const payload = {
      userId: String(userRef._id),
      bookingId: payment.bookingId || "",
      flightId: bookingRef ? bookingRef.flightId : "",
      amount,
      currency,
      paymentMethod: payment.paymentMethod || "credit_card",
      cardNumber: payment.cardLastFour || "4242",
      cardHolderName: payment.cardHolderName || "",
      expiryMonth: payment.expiryMonth || "",
      expiryYear: payment.expiryYear || "",
      paypalEmail: payment.paypalEmail || "",
      bankAccountNumber: payment.bankAccountNumber || "",
      bankName: payment.bankName || "",
      upiId: payment.upiId || "",
      netBankingProvider: payment.netBankingProvider || "",
      transactionId,
      status: payment.paymentStatus || "completed",
      gatewayResponse: payment.gatewayResponse || {},
      paymentGateway: payment.gatewayName || "razorpay",
      gatewayTransactionId: payment.gatewayTransactionId || transactionId,
      ipAddress: payment.ipAddress || "192.168.1.1",
      userAgent: payment.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      deviceType: payment.deviceType || "desktop",
      browser: payment.browser || "Chrome",
      os: payment.os || "Windows",
      location: payment.location || "New York, US",
      paidAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
      refundedAt: payment.refundDate ? new Date(payment.refundDate) : null,
      refundAmount: toNumber(payment.refundAmount, 0),
      refundReason: payment.refundReason || "",
      processingFee: toNumber(payment.processingFee, 0),
      taxAmount: toNumber(payment.taxAmount, 0),
      discountAmount: toNumber(payment.discountAmount, 0),
      couponCode: payment.couponCode || "",
      notes: payment.notes || "",
      metadata: {
        cardType: payment.cardType || "Visa",
        billingAddress: payment.billingAddress || userRef.address || "",
        isRefunded: payment.isRefunded || false,
        ...payment.metadata,
      },
    };

    await PaymentModel.findOneAndUpdate(
      { transactionId },
      { $set: payload },
      { upsert: true, new: true }
    );
  }

  const [uCount, fCount, bCount, iCount, pCount] = await Promise.all([
    UserModel.countDocuments(),
    FlightModel.countDocuments(),
    FlightBookingModel.countDocuments(),
    IssueModel.countDocuments(),
    PaymentModel.countDocuments(),
  ]);

  console.log("Seed completed.");
  console.log(`Users: ${uCount}`);
  console.log(`Flights: ${fCount}`);
  console.log(`Bookings: ${bCount}`);
  console.log(`Issues: ${iCount}`);
  console.log(`Payments: ${pCount}`);

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error("Seed failed:", err.message || err);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
