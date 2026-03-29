const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    userId: { type: String, unique: false, required: true },
    bookingId: { type: String, unique: false, required: true },
    flightId: { type: String, unique: false, required: true },
    amount: { type: Number, unique: false, required: true },
    currency: { type: String, unique: false, required: false, default: "INR" },
    paymentMethod: { type: String, unique: false, required: true }, // e.g., 'credit_card', 'debit_card', 'paypal', 'bank_transfer', 'upi', 'net_banking'
    cardNumber: { type: String, unique: false, required: false }, // Last 4 digits or tokenized
    cardHolderName: { type: String, unique: false, required: false },
    expiryMonth: { type: String, unique: false, required: false },
    expiryYear: { type: String, unique: false, required: false },
    cvv: { type: String, unique: false, required: false }, // Should be handled securely, not stored
    paypalEmail: { type: String, unique: false, required: false },
    bankAccountNumber: { type: String, unique: false, required: false },
    bankName: { type: String, unique: false, required: false },
    upiId: { type: String, unique: false, required: false },
    netBankingProvider: { type: String, unique: false, required: false },
    transactionId: { type: String, unique: true, required: true },
    status: { type: String, unique: false, required: true, default: "pending" }, // pending, completed, failed, refunded, cancelled
    gatewayResponse: { type: Schema.Types.Mixed, required: false, default: {} },
    paymentGateway: { type: String, unique: false, required: false, default: "razorpay" }, // razorpay, paypal, stripe, etc.
    gatewayTransactionId: { type: String, unique: false, required: false },
    ipAddress: { type: String, unique: false, required: false },
    userAgent: { type: String, unique: false, required: false },
    deviceType: { type: String, unique: false, required: false }, // mobile, desktop, tablet
    browser: { type: String, unique: false, required: false },
    os: { type: String, unique: false, required: false },
    location: { type: String, unique: false, required: false }, // city, country
    paidAt: { type: Date, required: false },
    refundedAt: { type: Date, required: false },
    refundAmount: { type: Number, required: false, default: 0 },
    refundReason: { type: String, required: false, default: "" },
    processingFee: { type: Number, required: false, default: 0 },
    taxAmount: { type: Number, required: false, default: 0 },
    discountAmount: { type: Number, required: false, default: 0 },
    couponCode: { type: String, required: false, default: "" },
    notes: { type: String, required: false, default: "" },
    metadata: { type: Schema.Types.Mixed, required: false, default: {} },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("payments", PaymentSchema);

module.exports = PaymentModel;