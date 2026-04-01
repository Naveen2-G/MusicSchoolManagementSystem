import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { ROLES } from "../utils/roles.js";
import { askSchoolChatbot } from "../controllers/chatbotController.js";

const router = express.Router();

router.use(auth, authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT));
router.post("/ask", askSchoolChatbot);

export default router;
