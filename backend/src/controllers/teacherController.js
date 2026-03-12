import { Teacher } from "../models/Teacher.js";
import { Student } from "../models/Student.js";
import { Schedule } from "../models/Schedule.js";
import { PracticeLog } from "../models/PracticeLog.js";
import { Salary } from "../models/Salary.js";
import { Recital } from "../models/Recital.js";
import { FAQ } from "../models/FAQ.js";
import { Attendance } from "../models/Attendance.js";

const normalizeDay = (inputDate) => {
  const date = inputDate ? new Date(inputDate) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getMyProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id }).populate("user");
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

export const getMyStudents = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });
    const students = await Student.find({ assignedTeacher: teacher._id }).populate("user");
    res.json(students);
  } catch (err) {
    next(err);
  }
};

export const getMySchedule = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });
    const schedules = await Schedule.find({ teacher: teacher._id }).populate({
      path: "students",
      populate: { path: "user" }
    });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { scheduleId, status } = req.body; // status: completed/cancelled
    const teacher = await Teacher.findOne({ user: req.user.id });
    const schedule = await Schedule.findOne({ _id: scheduleId, teacher: teacher._id });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    schedule.status = status || "completed";
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    next(err);
  }
};

export const markStudentAttendance = async (req, res, next) => {
  try {
    const { studentId, scheduleId, status, date, notes } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });

    if (!scheduleId) {
      return res.status(400).json({ message: "scheduleId is required to mark class attendance." });
    }

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required to mark class attendance." });
    }

    const schedule = await Schedule.findOne({
      _id: scheduleId,
      teacher: teacher._id,
      students: studentId
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found for this student." });
    }

    // Do not block attendance by assignedTeacher so admin reassignments don't break historical/current class marking.
    const student = await Student.findById(studentId).populate("user");
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const attendanceDate = schedule?.startTime ? new Date(schedule.startTime) : normalizeDay(date);

    const attendance = await Attendance.findOneAndUpdate(
      {
        teacher: teacher._id,
        student: student._id,
        schedule: schedule?._id,
        date: attendanceDate
      },
      {
        $set: {
          status: status || "Present",
          notes: notes || "",
          markedAt: new Date(),
          schedule: schedule?._id
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    )
      .populate({ path: "student", populate: { path: "user" } })
      .populate("schedule");

    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

export const getMyStudentAttendance = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });

    const date = normalizeDay(req.query.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Attendance.find({
      teacher: teacher._id,
      date: { $gte: date, $lt: nextDay }
    })
      .populate({ path: "student", populate: { path: "user" } })
      .populate("schedule");

    res.json(records);
  } catch (err) {
    next(err);
  }
};

export const getStudentPracticeLogs = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const students = await Student.find({ assignedTeacher: teacher._id });
    const studentIds = students.map((s) => s._id);
    const logs = await PracticeLog.find({ student: { $in: studentIds } }).populate({
      path: "student",
      populate: { path: "user" }
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const addPracticeFeedback = async (req, res, next) => {
  try {
    const { logId, feedback } = req.body;
    const log = await PracticeLog.findById(logId).populate({
      path: "student",
      populate: { path: "user" }
    });
    if (!log) return res.status(404).json({ message: "Practice log not found" });
    log.teacherFeedback = feedback;
    log.feedbackGivenAt = new Date();
    await log.save();
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const getMySalaries = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const salaries = await Salary.find({ teacher: teacher._id });
    res.json(salaries);
  } catch (err) {
    next(err);
  }
};

export const getUpcomingRecitals = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const recitals = await Recital.find({
      mentoringTeachers: teacher._id,
      date: { $gte: new Date() }
    });
    res.json(recitals);
  } catch (err) {
    next(err);
  }
};

export const getFAQsForTeacher = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true });
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};


