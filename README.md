# 🎼 Music School Management System

A **full-stack web application** for managing music school operations such as student enrollments, teacher schedules, fee payments, attendance tracking, practice logs, and recital management.

Built with **Node.js, Express, MongoDB, React, and Stripe**, the system supports multiple roles including **Admin, Teacher, Student, and Public users**.

---

# ⭐ Features

## 🔐 Role-Based Authentication

* JWT based authentication
* Separate dashboards for:

  * Admin
  * Teachers
  * Students

## 👨‍🎓 Student Management

* Student enrollment requests
* Practice log tracking
* Fee payment system (Stripe integration)
* Attendance tracking
* Recital participation
* Student dashboard

## 👨‍🏫 Teacher Management

* Manage assigned students
* Track attendance
* Review practice logs
* View teaching schedules
* Salary tracking

## 🧑‍💼 Admin Dashboard

* Manage teachers and students
* Approve enrollment requests
* Manage recitals and schedules
* Monitor fee payments
* Salary management
* System-wide reporting

## 🌐 Public Landing Page

* Music school introduction
* Instruments offered
* Testimonials
* Enrollment form
* FAQ section

---

# 🏗️ Architecture

Client (React + Vite)
⬇
REST API (Node.js + Express)
⬇
Database (MongoDB)

Authentication handled using **JWT tokens**
Payments processed using **Stripe API**

---

# 🛠️ Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Stripe API
* Morgan Logger
* CORS

## Frontend

* React 18
* Vite
* React Router
* Axios
* Context API
* Tailwind CSS

---

# 📋 Prerequisites

Make sure you have installed:

* Node.js (v18 or higher)
* MongoDB (Local or Atlas)
* Stripe account (Test API keys)

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Naveen2-G/MusicSchoolManagementSystem.git
cd MusicSchoolManagementSystem
```

---

## 2️⃣ Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

# ⚙️ Environment Setup

Environment variables are **not included in the repository for security reasons**.

Create `.env` from the example file.

### Linux / Mac

```bash
cp backend/.env.example backend/.env
```

### Windows

```bash
copy backend\.env.example backend\.env
```

Example `.env` configuration:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/music_school

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@musicschool.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@12345

FRONTEND_URL=http://localhost:5173

STRIPE_PUBLISHABLE_KEY=pk_test_XXXX
STRIPE_SECRET_KEY=sk_test_XXXX
```

---

# ▶️ Running the Application

## Start Backend

```bash
cd backend
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

## Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 First Login

Default Admin account is automatically created on first run.

```
Username: admin
Email: admin@musicschool.com
Password: Admin@12345
```

You should **change the password after first login**.

---

# 📁 Project Structure

```
MusicSchoolManagementSystem
│
├── backend
│   ├── src
│   │   ├── config
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── controllers
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   └── teacherController.js
│   │   │
│   │   ├── middleware
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── models
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Teacher.js
│   │   │   ├── Fee.js
│   │   │   ├── Attendance.js
│   │   │   ├── PracticeLog.js
│   │   │   ├── Recital.js
│   │   │   └── Salary.js
│   │   │
│   │   ├── routes
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── teacherRoutes.js
│   │   │   └── studentRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   │   ├── admin
│   │   │   ├── student
│   │   │   └── teacher
│   │   │
│   │   ├── state
│   │   │   └── AuthContext.jsx
│   │   │
│   │   └── utils
│   │       └── api.js
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🔌 API Endpoints

Base URL

```
http://localhost:5000/api
```

| Endpoint | Description         | Access  |
| -------- | ------------------- | ------- |
| /auth    | Login / Register    | Public  |
| /admin   | Admin operations    | Admin   |
| /teacher | Teacher dashboard   | Teacher |
| /student | Student dashboard   | Student |
| /health  | Server health check | Public  |

---

# 🧪 Development

Run backend in development mode:

```bash
npm run dev
```

Frontend uses **Vite Hot Reload**.

Build production frontend:

```bash
npm run build
```

---

# 🤝 Contributing

Contributions are welcome!

Steps:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to branch

```bash
git push origin feature/new-feature
```

5. Create a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🙌 Acknowledgments

Built with ❤️ for music education.

If you find this project helpful, please **⭐ star the repository**.
