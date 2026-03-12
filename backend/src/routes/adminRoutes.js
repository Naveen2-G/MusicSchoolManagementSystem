import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  createTeacher,
  updateTeacher,
  listTeachers,
  createStudent,
  updateStudent,
  listStudents,
  createSchedule,
  updateSchedule,
  listSchedules,
  listPracticeLogs,
  upsertFee,
  listFees,
   getFeePaymentSummary,
  createOrUpdateSalary,
  listSalaries,
  createRecital,
  updateRecital,
  listRecitals,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  listFAQs,
  updateTeacherContact,
  updateStudentContact,

  // ✅ Enrollment
  createEnrollmentRequest,
  listEnrollmentRequests,
  updateEnrollmentRequestStatus,
  deleteEnrollmentRequest,
  getEnrollmentRequestsCount,
  logout
} from "../controllers/adminController.js";

const router = express.Router();

/* =====================================================
   ✅ PUBLIC ROUTE (Landing Page Enrollment)
===================================================== */
router.post("/enrollments", createEnrollmentRequest);

/* =====================================================
   🔒 ADMIN PROTECTED ROUTES
===================================================== */
router.use(auth, isAdmin);

// User management
router.post("/teachers", createTeacher);
router.get("/teachers", listTeachers);
router.put("/teachers/:id", updateTeacher);
router.put("/teachers/:id/contact", updateTeacherContact);

router.post("/students", createStudent);
router.get("/students", listStudents);
router.put("/students/:id", updateStudent);
router.put("/students/:id/contact", updateStudentContact);

// Scheduling
router.post("/schedules", createSchedule);
router.get("/schedules", listSchedules);
router.put("/schedules/:id", updateSchedule);

// Practice logs view
router.get("/practice-logs", listPracticeLogs);

// Fees
router.post("/fees", upsertFee);
router.get("/fees", listFees);
router.get("/fees/payment-summary", getFeePaymentSummary);

// Salaries
router.post("/salaries", createOrUpdateSalary);
router.get("/salaries", listSalaries);

// Recitals
router.post("/recitals", createRecital);
router.get("/recitals", listRecitals);
router.put("/recitals/:id", updateRecital);

// FAQs
router.post("/faqs", createFAQ);
router.get("/faqs", listFAQs);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", deleteFAQ);

/* =====================================================
   📌 ENROLLMENT MANAGEMENT (Admin Dashboard)
===================================================== */
router.get("/enrollment-requests", listEnrollmentRequests);
router.put("/enrollment-requests/:id/status", updateEnrollmentRequestStatus);
router.delete("/enrollment-requests/:id", deleteEnrollmentRequest);
router.get("/enrollment-requests/count", getEnrollmentRequestsCount);

// Logout
router.post("/logout", logout);

export default router;
