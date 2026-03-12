import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    year: { type: Number, required: true },
    instrument: { type: String, required: true },
    courseLevel: { type: String, required: true },
    yearlyFee: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paymentTransactions: [
      {
        amount: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        paymentId: { type: String, required: true },
        orderId: { type: String, required: true },
        signature: { type: String, required: true },
        paidAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Compound unique index on student and year
feeSchema.index({ student: 1, year: 1 }, { unique: true });

feeSchema.virtual("balance").get(function () {
  return this.yearlyFee - this.amountPaid;
});

feeSchema.virtual("status").get(function () {
  if (this.amountPaid > this.yearlyFee) return "Overpaid";
  if (this.amountPaid === this.yearlyFee) return "Paid";
  if (this.amountPaid > 0) return "Partially Paid";
  return "Pending";
});

export const Fee = mongoose.model("Fee", feeSchema);


