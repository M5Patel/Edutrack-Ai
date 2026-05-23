# 🎓 EduTrack AI

**Smart Daily Work Submission & Tracking System** — A production-ready MERN stack application with Agentic AI for educational institutes.

## ✨ Features

- **Role-Based Dashboards** — Admin, Faculty, Student views
- **Daily Work Submission** — Drag & drop file uploads with version history
- **AI-Powered Analysis** — Auto-scoring, summarization, and tagging via GPT-4o
- **Real-Time Notifications** — Socket.io powered instant updates
- **Gamification** — Streaks 🔥, badges 🏆, and leaderboards
- **AI Chat Assistant** — Context-aware student companion
- **Smart Analytics** — Heatmaps, charts, export to PDF/Excel
- **Dark/Light Mode** — Beautiful theme toggle with smooth transitions
- **Email Alerts** — Automated missing submission notifications

## 🧱 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand |
| Backend | Node.js, Express, MongoDB, Mongoose, Socket.io |
| AI | OpenAI GPT-4o, LangChain.js |
| Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |

## 🚀 Getting Started

```bash
# 1. Clone and install
git clone <repo>
cd edutrack-ai
npm run install-all

# 2. Setup environment
cp .env.example server/.env
# Edit server/.env with your values

# 3. Seed database
npm run seed

# 4. Start development
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

## 🔐 Login Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edutrack.com | Admin@123 |
| Faculty | faculty1@edutrack.com | Faculty@123 |
| Student | student1@edutrack.com | Student@123 |

## 📁 Project Structure

```
edutrack-ai/
├── client/          ← React + Vite frontend
│   └── src/
│       ├── components/   ← Reusable UI components
│       ├── pages/        ← Route pages by role
│       ├── services/     ← API service layer
│       ├── store/        ← Zustand state management
│       └── hooks/        ← Custom React hooks
│
└── server/          ← Express.js backend
    ├── models/      ← Mongoose schemas
    ├── routes/      ← API route definitions
    ├── controllers/ ← Route handlers
    ├── agents/      ← LangChain AI agents
    ├── services/    ← Email, cron, notifications
    └── middleware/  ← Auth, roles, uploads
```

## 📄 License

MIT
