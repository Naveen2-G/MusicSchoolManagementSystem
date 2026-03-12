/* =======================
   IMPORTS
======================= */
import { User } from "../models/User.js";
import { Teacher } from "../models/Teacher.js";
import { Student } from "../models/Student.js";
import { Schedule } from "../models/Schedule.js";
import { PracticeLog } from "../models/PracticeLog.js";
import { Fee } from "../models/Fee.js";
import { Salary } from "../models/Salary.js";
import { Recital } from "../models/Recital.js";
import { FAQ } from "../models/FAQ.js";
import { EnrollmentRequest } from "../models/EnrollmentRequest.js";
import { ROLES } from "../utils/roles.js";

/* =======================
   TEACHERS
======================= */
export const createTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      username,
      password,
      instruments,
      bio,
      salaryType,
      salaryAmount,
      contactNumber
    } = req.body;

    const user = await User.create({
      name,
      email,
      username,
      password,
      role: ROLES.TEACHER,
      contactNumber,
      forcePasswordChange: true
    });

    const teacher = await Teacher.create({
      user: user._id,
      instruments,
      bio,
      salaryType,
      salaryAmount
    });

    res.status(201).json({ user, teacher });
  } catch (err) {
    next(err);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, username, isActive, instruments, bio, salaryType, salaryAmount } =
      req.body;

    const teacher = await Teacher.findById(id).populate("user");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (name !== undefined) teacher.user.name = name;
    if (email !== undefined) teacher.user.email = email;
    if (username !== undefined) teacher.user.username = username;
    if (isActive !== undefined) teacher.user.isActive = isActive;
    if (instruments !== undefined) teacher.instruments = instruments;
    if (bio !== undefined) teacher.bio = bio;
    if (salaryType !== undefined) teacher.salaryType = salaryType;
    if (salaryAmount !== undefined) teacher.salaryAmount = salaryAmount;

    await teacher.user.save();
    await teacher.save();

    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

export const listTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate("user");
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

export const updateTeacherContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contactNumber } = req.body;

    const teacher = await Teacher.findById(id).populate("user");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.user.contactNumber = contactNumber;
    await teacher.user.save();

    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

/* =======================
   STUDENTS
======================= */
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      username,
      password,
      assignedTeacherId,
      instrument,
      courseLevel,
      contactNumber
    } = req.body;

    const user = await User.create({
      name,
      email,
      username,
      password,
      role: ROLES.STUDENT,
      contactNumber,
      forcePasswordChange: true
    });

    const student = await Student.create({
      user: user._id,
      assignedTeacher: assignedTeacherId || undefined,
      instrument,
      courseLevel
    });

    res.status(201).json({ user, student });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      username,
      isActive,
      assignedTeacherId,
      instrument,
      courseLevel
    } = req.body;

    const student = await Student.findById(id).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name !== undefined) student.user.name = name;
    if (email !== undefined) student.user.email = email;
    if (username !== undefined) student.user.username = username;
    if (isActive !== undefined) student.user.isActive = isActive;
    if (assignedTeacherId !== undefined)
      student.assignedTeacher = assignedTeacherId;
    if (instrument !== undefined) student.instrument = instrument;
    if (courseLevel !== undefined) student.courseLevel = courseLevel;

    await student.user.save();
    await student.save();

    res.json(student);
  } catch (err) {
    next(err);
  }
};

export const listStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate("user")
      .populate({ path: "assignedTeacher", populate: { path: "user" } });

    res.json(students);
  } catch (err) {
    next(err);
  }
};

export const updateStudentContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contactNumber } = req.body;

    const student = await Student.findById(id).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.user.contactNumber = contactNumber;
    await student.user.save();

    res.json(student);
  } catch (err) {
    next(err);
  }
};

/* =======================
   SCHEDULES
======================= */
export const createSchedule = async (req, res, next) => {
  try {
    const { teacherId, studentIds, startTime, endTime, room } = req.body;

    const conflict = await Schedule.findOne({
      teacher: teacherId,
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) }
    });

    if (conflict) {
      return res.status(400).json({ message: "Scheduling conflict" });
    }

    const schedule = await Schedule.create({
      teacher: teacherId,
      students: studentIds,
      startTime,
      endTime,
      room
    });

    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    Object.assign(schedule, req.body);
    await schedule.save();

    res.json(schedule);
  } catch (err) {
    next(err);
  }
};

export const listSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find()
      .populate({ path: "teacher", populate: { path: "user" } })
      .populate({ path: "students", populate: { path: "user" } });

    res.json(schedules);
  } catch (err) {
    next(err);
  }
};

/* =======================
   PRACTICE LOGS
======================= */
export const listPracticeLogs = async (req, res, next) => {
  try {
    const logs = await PracticeLog.find().populate("student");
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

/* =======================
   FEES
======================= */
export const upsertFee = async (req, res, next) => {
  try {
    const { studentId, year, ...feeData } = req.body;

    let fee = await Fee.findOne({ student: studentId, year });
    if (!fee) {
      fee = await Fee.create({
        student: studentId,
        year,
        ...feeData
      });
    } else {
      Object.assign(fee, feeData);
    }

    await fee.save();
    res.json(fee);
  } catch (err) {
    next(err);
  }
};

export const listFees = async (req, res, next) => {
  try {
    const fees = await Fee.find().populate({
      path: "student",
      populate: { path: "user" }
    });
    res.json(fees);
  } catch (err) {
    next(err);
  }
};

export const getFeePaymentSummary = async (req, res, next) => {
  try {
    const yearParam = Number(req.query.year);
    const year = Number.isFinite(yearParam) && yearParam > 0
      ? yearParam
      : new Date().getFullYear();

    const [students, fees] = await Promise.all([
      Student.find().populate("user"),
      Fee.find({ year }).populate({
        path: "student",
        populate: { path: "user" }
      })
    ]);

    const feeByStudentId = new Map(
      fees.map((fee) => [String(fee.student?._id), fee])
    );

    const paidStudents = [];
    const unpaidStudents = [];

    for (const student of students) {
      const fee = feeByStudentId.get(String(student._id));

      if (!fee) {
        unpaidStudents.push({
          studentId: student._id,
          name: student.user?.name || "Unknown",
          year,
          instrument: student.instrument || "",
          courseLevel: student.courseLevel || "",
          yearlyFee: null,
          amountPaid: 0,
          balance: null,
          status: "No Fee Record"
        });
        continue;
      }

      const balance = fee.yearlyFee - fee.amountPaid;
      const summary = {
        studentId: student._id,
        name: fee.student?.user?.name || student.user?.name || "Unknown",
        year: fee.year,
        instrument: fee.instrument,
        courseLevel: fee.courseLevel,
        yearlyFee: fee.yearlyFee,
        amountPaid: fee.amountPaid,
        balance,
        status:
          balance < 0
            ? "Overpaid"
            : balance === 0
              ? "Paid"
              : fee.amountPaid > 0
                ? "Partially Paid"
                : "Pending"
      };

      if (balance <= 0) {
        paidStudents.push(summary);
      } else {
        unpaidStudents.push(summary);
      }
    }

    res.json({
      year,
      paidCount: paidStudents.length,
      unpaidCount: unpaidStudents.length,
      paidStudents,
      unpaidStudents
    });
  } catch (err) {
    next(err);
  }
};

/* =======================
   SALARIES
======================= */
export const createOrUpdateSalary = async (req, res, next) => {
  try {
    const { teacherId, period, ...salaryData } = req.body;

    let salary = await Salary.findOne({ teacher: teacherId, period });
    if (!salary) {
      salary = await Salary.create({
        teacher: teacherId,
        period,
        ...salaryData
      });
    } else {
      Object.assign(salary, salaryData);
    }

    await salary.save();
    res.json(salary);
  } catch (err) {
    next(err);
  }
};

export const listSalaries = async (req, res, next) => {
  try {
    const salaries = await Salary.find().populate({
      path: "teacher",
      populate: { path: "user" }
    });
    res.json(salaries);
  } catch (err) {
    next(err);
  }
};

/* =======================
   RECITALS
======================= */
export const createRecital = async (req, res, next) => {
  try {
    const recital = await Recital.create(req.body);
    res.status(201).json(recital);
  } catch (err) {
    next(err);
  }
};

export const updateRecital = async (req, res, next) => {
  try {
    const recital = await Recital.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(recital);
  } catch (err) {
    next(err);
  }
};

export const listRecitals = async (req, res, next) => {
  try {
    const recitals = await Recital.find()
      .populate("students")
      .populate("mentoringTeachers");
    res.json(recitals);
  } catch (err) {
    next(err);
  }
};

/* =======================
   FAQ
======================= */
export const createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted" });
  } catch (err) {
    next(err);
  }
};

export const listFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

/* =======================
   ENROLLMENT REQUESTS
======================= */
export const createEnrollmentRequest = async (req, res) => {
  try {
    const enrollment = await EnrollmentRequest.create(req.body);
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listEnrollmentRequests = async (req, res) => {
  try {
    const enrollments = await EnrollmentRequest.find().sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEnrollmentRequestStatus = async (req, res) => {
  try {
    const updated = await EnrollmentRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getEnrollmentRequestsCount = async (req, res) => {
  try {
    const count = await EnrollmentRequest.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEnrollmentRequest = async (req, res) => {
  try {
    const enrollment = await EnrollmentRequest.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment request not found" });
    }
    res.json({ message: "Enrollment request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};
