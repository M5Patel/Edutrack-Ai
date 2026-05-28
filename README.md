# 🎓 EduTrack AI
**Smart Daily Work Submission & Tracking System for Educational Institutes**

EduTrack AI is a production-ready, full-stack application designed to streamline daily work submission, automated checking, and tracking within educational institutions. Leveraging a React/Vite frontend and an Express/Node.js backend integrated with Supabase PostgreSQL, this platform enables role-based interactions for Admins, Faculty, and Students.

---

## 🏗️ Project Architecture & Client Location

The project is structured as a unified repository (monorepo format merged into a single root) to simplify deployment and local development:

*   **Client (Frontend)**: The client application and configuration files are located directly in the **root directory**.
    *   Source Files: [`src/`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/src) containing components, pages, context, and hooks.
    *   Client Entry Points & Configuration: [`index.html`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/index.html), [`vite.config.js`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/vite.config.js), [`tailwind.config.js`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/tailwind.config.js), and [`postcss.config.js`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/postcss.config.js).
*   **Server (Backend)**: The backend API files are located inside the [`server/`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/server) directory.
    *   API Entry Point: [`server/server.js`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/server/server.js).
    *   Routing: [`server/routes/`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/server/routes).
    *   Database & Schema: [`server/config/`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/server/config) containing the SQL schema.
    *   Scheduled Jobs & Services: [`server/services/`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/server/services).

---

## ⚡ Tech Stack

*   **Frontend**: React (v18), Vite, Zustand (State Management), TailwindCSS, Framer Motion (Animations), Recharts (Data Visualizations), React Router (Routing).
*   **Backend**: Node.js, Express, Socket.io (Real-time events), Node-cron (Scheduled tasks), Nodemailer (Emails), Axios.
*   **Database & Auth**: Supabase PostgreSQL & Supabase Auth.
*   **File Storage**: Cloudinary (for storing submitted student work files).

---

## 📦 Database Schema

EduTrack AI uses PostgreSQL in Supabase. The database contains the following tables:

1.  **`profiles`**: Linked to Supabase Auth (`auth.users`) to handle User profiles and roles (`admin`, `faculty`, `student`).
2.  **`streams`**: Academic departments/streams (e.g., Computer Science, IT, Mechanical).
3.  **`students`**: Student metrics, roll numbers, submission streaks, and total submission counts.
4.  **`faculty`**: Faculty profiles, departments, and total reviews performed.
5.  **`submissions`**: Uploaded daily work containing version history, status (`submitted`, `reviewed`, `approved`, `needs_improvement`), and scoring.
6.  **`feedback`**: Reviews and ratings given by faculty to submissions.
7.  **`badges`**: Available badges for gamification (e.g., "First Step", "On Fire" streak badges).
8.  **`student_badges`**: Map of which badges have been earned by which students.
9.  **`notifications`**: In-app notifications sent in real-time.
10. **`audit_logs`**: System logs tracking user actions, entities modified, and IP addresses.

*Note: Database triggers automatically create a profile on new user signup and handle `updated_at` timestamps.*

---
## 🚀 Setup & Installation

### 1. Prerequisites
*   Node.js (v18+ recommended)
*   A Supabase project (with SQL Editor access)
*   A Cloudinary account (for file storage)

### 2. Install Dependencies
Run the following command in the root folder to install all client and server dependencies:
```bash
npm install
```

### 3. Initialize Database
1.  Open the SQL Editor in your Supabase dashboard.
2.  Copy the SQL commands from [`server/config/schema.sql`](file:///c:/Users/hdlic/Desktop/Project/edutrack%20AI/server/config/schema.sql).
3.  Paste the SQL commands and click **Run** to set up tables, relationships, triggers, indexes, and insert the default badges.

### 4. Seed Seed-Data
Seed default streams, an admin account, faculty members, students, and demo submissions:
```bash
npm run seed
```

### 5. Running the Application
Run both the React client and the Node server concurrently using:
```bash
npm run dev
```
*   **Vite Frontend**: http://localhost:5173
*   **Express Server**: http://localhost:5000

---

## ✨ Features

*   **Role-Based Access**: Specialized interfaces for Admins (manage users/streams), Faculty (review/grade), and Students (submit work).
*   **Daily Work Submissions**: Versioned file uploading supported by Cloudinary.
*   **Gamification Engine**: Automatic streaks 🔥 tracking and badges 🏆 allocation (like *Perfect Week*, *Top Scorer*) to encourage consistency.
*   **Real-time notifications**: In-app notifications powered by Socket.io.
*   **Automatic Cron Checkups**: A daily cron job runs at 11:45 PM to reset student streaks and send alerts/emails if submissions are missed.
*   **Comprehensive Audit Logging**: Tracks every action for security and visibility.

---

## 📄 License
MIT
