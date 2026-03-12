import { Student } from "../models/Student.js";
import { Teacher } from "../models/Teacher.js";
import { Schedule } from "../models/Schedule.js";
import { PracticeLog } from "../models/PracticeLog.js";
import { Fee } from "../models/Fee.js";
import { Recital } from "../models/Recital.js";
import { FAQ } from "../models/FAQ.js";
import { Attendance } from "../models/Attendance.js";
import Stripe from "stripe";
import { ENV } from "../config/env.js";

const stripeClient =
  ENV.STRIPE_SECRET_KEY
    ? new Stripe(ENV.STRIPE_SECRET_KEY, {
        appInfo: {
          name: "Music School Management System"
        }
      })
    : null;

export const getMyProfileStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate("user")
      .populate({
        path: "assignedTeacher",
        populate: { path: "user" }
      });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

export const getMyScheduleStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const schedules = await Schedule.find({ students: student._id }).populate({
      path: "teacher",
      populate: { path: "user" }
    });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
};

export const submitPracticeLog = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { date, durationMinutes, notes } = req.body;
    const log = await PracticeLog.create({
      student: student._id,
      date,
      durationMinutes,
      notes
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

export const getMyPracticeLogs = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const logs = await PracticeLog.find({ student: student._id });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const attendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(30)
      .populate({ path: "teacher", populate: { path: "user" } })
      .populate("schedule");

    const summary = attendance.reduce(
      (acc, item) => {
        const key = item.status || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { Present: 0, Absent: 0, Late: 0, Excused: 0 }
    );

    res.json({
      summary,
      records: attendance
    });
  } catch (err) {
    next(err);
  }
};

export const getMyFees = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const fees = await Fee.find({ student: student._id });
    res.json(
      fees.map((f) => ({
        id: f._id,
        year: f.year,
        instrument: f.instrument,
        courseLevel: f.courseLevel,
        yearlyFee: f.yearlyFee,
        amountPaid: f.amountPaid,
        balance: f.balance,
        status: f.status,
        paymentTransactions: (f.paymentTransactions || []).map((t) => ({
          amount: t.amount,
          currency: t.currency,
          paymentId: t.paymentId,
          orderId: t.orderId,
          paidAt: t.paidAt
        }))
      }))
    );
  } catch (err) {
    next(err);
  }
};

export const createFeeCheckoutSession = async (req, res, next) => {
  try {
    if (!stripeClient || !ENV.STRIPE_PUBLISHABLE_KEY) {
      return res.status(500).json({
        message: "Stripe is not configured. Please contact admin."
      });
    }

    const student = await Student.findOne({ user: req.user.id });
    const fee = await Fee.findOne({ _id: req.params.feeId, student: student._id });
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    const requestedAmount = Number(req.body?.amount);
    const amountToPay = Number.isFinite(requestedAmount) && requestedAmount > 0 ? requestedAmount : fee.balance;

    if (amountToPay <= 0) {
      return res.status(400).json({ message: "No pending amount for this fee." });
    }

    if (amountToPay > fee.balance) {
      return res.status(400).json({ message: "Amount cannot be greater than pending balance." });
    }

    const unitAmount = Math.round(amountToPay * 100);
    const successUrl = `${ENV.FRONTEND_URL}/student/fees?session_id={CHECKOUT_SESSION_ID}&fee_id=${fee._id}`;
    const cancelUrl = `${ENV.FRONTEND_URL}/student/fees?canceled=1&fee_id=${fee._id}`;

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        feeId: String(fee._id),
        studentId: String(student._id),
        year: String(fee.year),
        amount: String(amountToPay)
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: unitAmount,
            product_data: {
              name: `Fee Payment - ${fee.instrument} (${fee.year})`,
              description: `Course level: ${fee.courseLevel}`
            }
          }
        }
      ]
    });

    res.json({
      sessionId: session.id,
      publishableKey: ENV.STRIPE_PUBLISHABLE_KEY,
      amount: amountToPay,
      currency: "INR",
      fee: {
        id: fee._id,
        year: fee.year,
        instrument: fee.instrument,
        courseLevel: fee.courseLevel
      }
    });
  } catch (err) {
    next(err);
  }
};

export const verifyFeeCheckoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!stripeClient) {
      return res.status(500).json({
        message: "Stripe is not configured. Please contact admin."
      });
    }

    if (!sessionId) {
      return res.status(400).json({ message: "Missing checkout session id." });
    }

    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"]
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment is not completed." });
    }

    const student = await Student.findOne({ user: req.user.id });
    const fee = await Fee.findOne({ _id: req.params.feeId, student: student._id });
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    if (session.metadata?.feeId && session.metadata.feeId !== String(fee._id)) {
      return res.status(400).json({ message: "Session fee mismatch." });
    }
    if (session.metadata?.studentId && session.metadata.studentId !== String(student._id)) {
      return res.status(400).json({ message: "Session student mismatch." });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const paymentAmount = Number((session.amount_total || 0) / 100);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount." });
    }

    const duplicate = (fee.paymentTransactions || []).some(
      (t) => t.paymentId === paymentIntentId
    );
    if (duplicate) {
      return res.json({
        message: "Payment already recorded",
        paymentId: paymentIntentId,
        orderId: session.id,
        amount: paymentAmount,
        fee: {
          id: fee._id,
          year: fee.year,
          amountPaid: fee.amountPaid,
          balance: fee.balance,
          status: fee.status
        }
      });
    }

    if (paymentAmount > fee.balance) {
      return res.status(400).json({ message: "Payment exceeds pending balance." });
    }

    fee.amountPaid += paymentAmount;
    fee.paymentTransactions.push({
      amount: paymentAmount,
      currency: (session.currency || "inr").toUpperCase(),
      paymentId: paymentIntentId || session.id,
      orderId: session.id,
      signature: "stripe_checkout",
      paidAt: new Date()
    });
    await fee.save();

    res.json({
      message: "Payment successful",
      paymentId: paymentIntentId,
      orderId: session.id,
      amount: paymentAmount,
      fee: {
        id: fee._id,
        year: fee.year,
        amountPaid: fee.amountPaid,
        balance: fee.balance,
        status: fee.status
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRecitals = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const recitals = await Recital.find({ students: student._id });
    res.json(recitals);
  } catch (err) {
    next(err);
  }
};

export const getFAQsForStudent = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true });
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};


