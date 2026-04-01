import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";

const QUICK_QUESTIONS_BY_ROLE = {
  admin: [
    "How do I review enrollment requests?",
    "How can I manage teacher salaries?",
    "Where can I create class schedules?",
    "How do I manage fees for students?"
  ],
  teacher: [
    "How do I mark student attendance?",
    "Where can I review practice logs?",
    "How can I check my teaching schedule?",
    "Where do I view my salary details?"
  ],
  student: [
    "How do I submit a practice log?",
    "How can I pay my pending fee?",
    "Where can I see my class schedule?",
    "How do I check my attendance records?"
  ]
};

const initialBotMessage = {
  role: "bot",
  text: "Hi! I am your school assistant. Ask me anything about enrollments, schedules, fees, attendance, recitals, and practice logs."
};

const ROLE_ASSISTANT_LABEL = {
  admin: "Admin Assistant",
  teacher: "Teacher Assistant",
  student: "Student Assistant"
};

const SchoolChatbot = ({ role }) => {
  const typingDelayMs = 22;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([initialBotMessage]);
  const [pendingBotReply, setPendingBotReply] = useState("");
  const [typedBotReply, setTypedBotReply] = useState("");

  const quickQuestions = useMemo(
    () => QUICK_QUESTIONS_BY_ROLE[role] || QUICK_QUESTIONS_BY_ROLE.student,
    [role]
  );

  const assistantLabel = useMemo(
    () => ROLE_ASSISTANT_LABEL[role] || "School Assistant",
    [role]
  );

  const isTyping = pendingBotReply.length > 0;

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading && !isTyping,
    [input, isLoading, isTyping]
  );

  useEffect(() => {
    if (!pendingBotReply) return;

    setTypedBotReply("");
    let currentIndex = 0;
    const timer = setInterval(() => {
      currentIndex += 1;
      setTypedBotReply(pendingBotReply.slice(0, currentIndex));

      if (currentIndex >= pendingBotReply.length) {
        clearInterval(timer);
        setMessages((prev) => [...prev, { role: "bot", text: pendingBotReply }]);
        setPendingBotReply("");
        setTypedBotReply("");
      }
    }, typingDelayMs);

    return () => clearInterval(timer);
  }, [pendingBotReply]);

  const queueBotReply = (replyText) => {
    setPendingBotReply(String(replyText || ""));
  };

  const submitQuestion = async (text) => {
    const question = String(text || "").trim();
    if (!question || isLoading || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/chatbot/ask", { question });
      const answer = data?.answer || "I could not find an answer right now. Please try again.";
      queueBotReply(answer);
    } catch (error) {
      const fallback =
        error?.response?.data?.message ||
        "I am having trouble right now. Please try again in a moment.";
      queueBotReply(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await submitQuestion(input);
  };

  return (
    <div className="school-chatbot">
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle school chatbot"
      >
        {isOpen ? "Close Assistant" : "School Assistant"}
      </button>

      {isOpen && (
        <section className="chatbot-panel" aria-label="School chatbot panel">
          <header className="chatbot-header">
            <h3>{assistantLabel}</h3>
            <p>Role-aware help for your dashboard</p>
          </header>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chatbot-message ${message.role === "user" ? "user" : "bot"}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && <div className="chatbot-message bot">Thinking...</div>}
            {isTyping && (
              <div className="chatbot-message bot">
                {typedBotReply}
                <span className="typing-cursor">|</span>
              </div>
            )}
          </div>

          <div className="chatbot-quick-questions">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                className="chatbot-chip"
                onClick={() => submitQuestion(question)}
                disabled={isLoading || isTyping}
              >
                {question}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a school-related question..."
              maxLength={500}
            />
            <button type="submit" disabled={!canSend}>
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default SchoolChatbot;
