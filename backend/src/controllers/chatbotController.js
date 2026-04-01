import { FAQ } from "../models/FAQ.js";
import { ROLES } from "../utils/roles.js";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "to",
  "for",
  "of",
  "on",
  "in",
  "at",
  "and",
  "or",
  "with",
  "from",
  "by",
  "about",
  "can",
  "i",
  "we",
  "you",
  "my",
  "our",
  "your",
  "how",
  "what",
  "when",
  "where",
  "why",
  "do",
  "does",
  "did",
  "please"
]);

const normalizeToken = (token = "") => {
  const cleaned = String(token || "").toLowerCase().trim();
  if (!cleaned) return "";

  if (cleaned.endsWith("ies") && cleaned.length > 4) {
    return `${cleaned.slice(0, -3)}y`;
  }

  if (cleaned.endsWith("es") && cleaned.length > 4) {
    return cleaned.slice(0, -2);
  }

  if (cleaned.endsWith("s") && cleaned.length > 3) {
    return cleaned.slice(0, -1);
  }

  if (cleaned.endsWith("ing") && cleaned.length > 5) {
    return cleaned.slice(0, -3);
  }

  return cleaned;
};

const KNOWLEDGE_RESPONSES = [
  {
    topic: "enrollment",
    allowedRoles: [ROLES.ADMIN],
    keywords: ["enroll", "enrollment", "admission", "join", "apply", "application"],
    answer:
      "You can submit enrollment requests from the landing page form. Admin reviews and approves requests from the Enrollments section in the admin dashboard."
  },
  {
    topic: "fees",
    allowedRoles: [ROLES.ADMIN, ROLES.STUDENT],
    keywords: ["fee", "fees", "payment", "pay", "balance", "stripe", "invoice"],
    answer:
      "Fee records are managed by admins, and students can view pending balances and complete payments from the Fees section. Online payments are processed through Stripe when configured."
  },
  {
    topic: "schedule",
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
    keywords: ["schedule", "class", "timetable", "timing", "lesson"],
    answer:
      "Class schedules are visible in each dashboard. Admin manages schedules, teachers view assigned classes, and students can see their own upcoming sessions."
  },
  {
    topic: "attendance",
    allowedRoles: [ROLES.TEACHER, ROLES.STUDENT],
    keywords: ["attendance", "present", "absent", "late"],
    answer:
      "Teachers can mark attendance for class sessions, and students can review their attendance history in their dashboard."
  },
  {
    topic: "practice",
    allowedRoles: [ROLES.TEACHER, ROLES.STUDENT],
    keywords: ["practice", "log", "homework", "feedback"],
    answer:
      "Students submit daily practice logs, and teachers can review logs and provide feedback to track progress."
  },
  {
    topic: "recitals",
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
    keywords: ["recital", "performance", "event", "concert"],
    answer:
      "Recitals are managed from the dashboard. Admin can organize recital details while teachers and students can view upcoming recital participation."
  },
  {
    topic: "teacher",
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
    keywords: ["teacher", "mentor", "salary", "payroll"],
    answer:
      "Admin can manage teacher profiles and salary records. Teachers can access their assigned students, schedules, and salary information from their dashboard."
  }
];

const tokenize = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => normalizeToken(token))
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));
};

const scoreFaqMatch = (questionTokens, faq) => {
  const faqTokens = new Set(tokenize(`${faq.question} ${faq.answer}`));
  if (!faqTokens.size) return 0;

  let overlapCount = 0;
  for (const token of questionTokens) {
    if (faqTokens.has(token)) overlapCount += 1;
  }
  return overlapCount;
};

const findBestKnowledgeAnswer = (questionTokens, userRole) => {
  const questionTokenSet = new Set(questionTokens);
  let best = null;
  let bestScore = 0;

  for (const item of KNOWLEDGE_RESPONSES) {
    const keywordSet = new Set(item.keywords.map((keyword) => normalizeToken(keyword)));
    let score = 0;

    for (const keyword of keywordSet) {
      if (questionTokenSet.has(keyword)) {
        score += 2;
        continue;
      }

      for (const token of questionTokenSet) {
        if (token.startsWith(keyword) || keyword.startsWith(token)) {
          score += 1;
          break;
        }
      }
    }

    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }

  if (bestScore <= 0) {
    return null;
  }

  if (!best.allowedRoles.includes(userRole)) {
    return {
      restricted: true,
      topic: best.topic
    };
  }

  return best;
};

const roleFallbackMessage = (role) => {
  if (role === ROLES.ADMIN) {
    return "I can help with admin topics like enrollments, schedule management, fees, salaries, recitals, users, and FAQs.";
  }

  if (role === ROLES.TEACHER) {
    return "I can help with teacher topics like schedules, attendance, practice logs, salary, recitals, students, and FAQs.";
  }

  return "I can help with student topics like your schedule, practice logs, fees, attendance, recitals, and FAQs.";
};

export const askSchoolChatbot = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ message: "question is required" });
    }

    if (question.length > 500) {
      return res.status(400).json({ message: "question is too long" });
    }

    const questionTokens = tokenize(question);
    const faqs = await FAQ.find({ isActive: true }).lean();

    let bestFaq = null;
    let bestFaqScore = 0;
    for (const faq of faqs) {
      const score = scoreFaqMatch(questionTokens, faq);
      if (score > bestFaqScore) {
        bestFaq = faq;
        bestFaqScore = score;
      }
    }

    if (bestFaq && bestFaqScore >= 2) {
      return res.json({
        answer: bestFaq.answer,
        source: "faq",
        matchedQuestion: bestFaq.question
      });
    }

    const fallbackKnowledge = findBestKnowledgeAnswer(questionTokens, userRole);
    if (fallbackKnowledge) {
      if (fallbackKnowledge.restricted) {
        return res.status(403).json({
          message: "This topic is restricted for your dashboard role.",
          answer: roleFallbackMessage(userRole),
          source: "restricted"
        });
      }

      return res.json({
        answer: fallbackKnowledge.answer,
        source: fallbackKnowledge.topic
      });
    }

    return res.json({
      answer: roleFallbackMessage(userRole),
      source: "default"
    });
  } catch (err) {
    next(err);
  }
};
