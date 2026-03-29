const mongoose = require("mongoose");
const FlightBookingModel = require("../models/flightbookingmodel");
const FlightModel = require("../models/flightmodel");
const UserModel = require("../models/usermodel");

const isDbConnected = () => mongoose.connection.readyState === 1;

const getDbError = () => ({
  isDone: false,
  isError: true,
  success: false,
  err: "Database connection unavailable",
  msg: "Database connection unavailable",
});

const toBookingDto = (bookingDoc, flightDoc = null) => {
  const economyTickets = bookingDoc.economyClassTickets || 0;
  const businessTickets = bookingDoc.businessClassTickets || 0;
  const firstTickets = bookingDoc.firstClassTickets || 0;
  const totalPassengers =
    bookingDoc.passengers || economyTickets + businessTickets + firstTickets;

  return {
    ...bookingDoc,
    _id: bookingDoc._id,
    id: bookingDoc._id,
    bookingId:
      bookingDoc.bookingId ||
      `BK${String(bookingDoc._id).slice(-8).toUpperCase()}`,
    passengers: totalPassengers,
    totalPrice: bookingDoc.totalPrice || bookingDoc.totalCost || 0,
    status: bookingDoc.status || "pending",
    bookingDate: bookingDoc.createdAt,
    flightDate:
      bookingDoc.flightDate ||
      flightDoc?.departureDate ||
      "",
    flightNumber:
      flightDoc?.flightNumber ||
      flightDoc?.name ||
      "",
    airline: flightDoc?.airline || "",
    source: flightDoc?.source || flightDoc?.routeSource || "",
    destination: flightDoc?.destination || flightDoc?.routeDestination || "",
    createdAt: bookingDoc.createdAt,
    updatedAt: bookingDoc.updatedAt,
  };
};

const getFlightBookings = async () => {
  try {
    if (!isDbConnected()) return getDbError();

    const data = await FlightBookingModel.find({}).lean();
    return {
      isDone: true,
      isError: false,
      success: true,
      data,
      total: data.length,
    };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

const getFlightBookingsById = async (id) => {
  try {
    if (!isDbConnected()) return getDbError();

    const data = await FlightBookingModel.find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    const flightIds = data.map((item) => item.flightId).filter(Boolean);
    const flights = await FlightModel.find({ _id: { $in: flightIds } }).lean();
    const flightMap = new Map(flights.map((f) => [String(f._id), f]));

    const enriched = [];
    const now = new Date();
    for (const booking of data) {
      let finalBooking = booking;
      if (String(booking.status || "").toLowerCase() === "confirmed") {
        const flightDate = new Date(booking.flightDate || booking.createdAt);
        if (flightDate < now) {
          await FlightBookingModel.findByIdAndUpdate(booking._id, { status: "completed" });
          finalBooking = { ...booking, status: "completed" };
        }
      }
      enriched.push(toBookingDto(finalBooking, flightMap.get(String(booking.flightId))));
    }

    return {
      isDone: true,
      isError: false,
      success: true,
      data: enriched,
      total: enriched.length,
    };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

const addFlightBookings = async (bookingData) => {
  try {
    if (!isDbConnected()) return getDbError();

    // if payment segment present, simulate gateway response
    if (bookingData.paymentMethod && bookingData.paymentStatus !== 'paid') {
      bookingData.paymentStatus = 'paid';
      bookingData.transactionId = bookingData.transactionId || `TX${Date.now()}`;
      bookingData.paidAt = bookingData.paidAt || new Date();
    }

    const data = await FlightBookingModel.insertMany([bookingData]);

    // Create payment record if payment details are present
    if (bookingData.paymentMethod && bookingData.totalCost) {
      const { createPayment } = require('./paymentcontroller');
      const paymentData = {
        userId: bookingData.userId,
        bookingId: bookingData.bookingId || data[0]._id.toString(),
        flightId: bookingData.flightId,
        amount: bookingData.totalCost,
        currency: 'INR',
        paymentMethod: bookingData.paymentMethod,
        transactionId: bookingData.transactionId,
        status: 'completed',
        paymentGateway: 'razorpay',
        paidAt: bookingData.paidAt || new Date(),
        notes: `Flight booking payment - ${bookingData.flightId}`,
      };

      // Create payment record asynchronously (don't wait for it to complete booking)
      createPayment(paymentData).catch((err) => console.error('Payment record creation failed:', err));
    }

    // Enrich booking output with flight + user info for receipt generation
    const flightIds = data.map((d) => String(d.flightId)).filter(Boolean);
    const userIds = data.map((d) => String(d.userId)).filter(Boolean);

    const flights = await FlightModel.find({ _id: { $in: flightIds } }).lean();
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();

    const flightMap = new Map(flights.map((f) => [String(f._id), f]));
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const enriched = data.map((doc) => {
      const booking = doc.toObject ? doc.toObject() : doc;
      const flight = flightMap.get(String(booking.flightId));
      const user = userMap.get(String(booking.userId));

      return {
        ...booking,
        flight: {
          flightNumber: flight?.flightNumber || '',
          airline: flight?.airline || '',
          routeSource: flight?.routeSource || flight?.source || '',
          routeDestination: flight?.routeDestination || flight?.destination || '',
          departureDate: flight?.departureDate || '',
          departureTime: flight?.departureTime || '',
        },
        user: {
          name: user?.name || booking.username || '',
          username: user?.username || booking.username || '',
          email: user?.email || booking.userEmail || '',
          phoneNo: user?.phoneNo || booking.userPhone || '',
        },
      };
    });

    return { isDone: true, isError: false, success: true, data: enriched };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

// Edit/Update Flight Booking
const editFlightBooking = async (bookingId, updateData) => {
  try {
    if (!isDbConnected()) return getDbError();
    if (!bookingId) {
      return {
        isDone: false,
        isError: true,
        success: false,
        msg: "Booking ID is required",
      };
    }

    const data = await FlightBookingModel.findByIdAndUpdate(bookingId, updateData, {
      new: true,
    });

    if (!data) {
      return { isDone: false, isError: true, success: false, msg: "Booking not found" };
    }

    return {
      isDone: true,
      isError: false,
      success: true,
      data: { modifiedCount: 1 },
    };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

// Delete Flight Booking
const deleteFlightBooking = async (bookingId) => {
  try {
    if (!isDbConnected()) return getDbError();
    if (!bookingId) {
      return {
        isDone: false,
        isError: true,
        success: false,
        msg: "Booking ID is required",
      };
    }

    const data = await FlightBookingModel.findByIdAndDelete(bookingId);

    if (!data) {
      return { isDone: false, isError: true, success: false, msg: "Booking not found" };
    }

    return {
      isDone: true,
      isError: false,
      success: true,
      data: { deletedCount: 1 },
    };
  } catch (err) {
    return { isDone: false, isError: true, success: false, err: err.message || err };
  }
};

module.exports = {
  getFlightBookings,
  getFlightBookingsById,
  addFlightBookings,
  editFlightBooking,
  deleteFlightBooking,
};
