import express from "express";
import { auth, isStudent } from "../middleware/auth.js";
import {
  getMyProfileStudent,
  getMyScheduleStudent,
  submitPracticeLog,
  getMyPracticeLogs,
  getMyAttendance,
  getMyFees,
  createFeeCheckoutSession,
  verifyFeeCheckoutSession,
  getMyRecitals,
  getFAQsForStudent
} from "../controllers/studentController.js";

const router = express.Router();

router.use(auth, isStudent);

router.get("/me", getMyProfileStudent);
router.get("/schedules", getMyScheduleStudent);
router.post("/practice-logs", submitPracticeLog);
router.get("/practice-logs", getMyPracticeLogs);
router.get("/attendance", getMyAttendance);
router.get("/fees", getMyFees);
router.post("/fees/:feeId/create-checkout-session", createFeeCheckoutSession);
router.post("/fees/:feeId/verify-checkout-session", verifyFeeCheckoutSession);
router.get("/recitals", getMyRecitals);
router.get("/faqs", getFAQsForStudent);

export default router;


