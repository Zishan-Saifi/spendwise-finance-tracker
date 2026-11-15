# 💰 SpendWise — Personal Finance Tracker

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38b2ac.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, full-stack personal finance and wealth management web application built to help users track cash flows, set category budgets, automate recurring commitments, reach savings goals, and generate itemized financial statements.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Bonus & Advanced Capabilities](#-bonus--advanced-capabilities)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Environment Variables](#-environment-variables)
- [Local Installation & Setup](#-local-installation--setup)
- [REST API Endpoints](#-rest-api-endpoints)
- [Deployment Guide](#-deployment-guide)
- [Author & Acknowledgements](#-author--acknowledgements)

---

## 🌟 Overview

Managing personal finances often involves fragmented spreadsheets and cumbersome tools. **SpendWise** unifies daily expense logging, visual budget pacing, recurring subscriptions, and target-based savings in an intuitive, responsive interface with both **Light and Dark mode** support.

Built with strict separation of concerns, the app provides real-time calculation of net balance, dynamic data visualizations via Recharts, instant CSV export, and client-side monthly PDF financial statements.

---

## 🚀 Key Features

### 1. 🔐 User Authentication & Security
- Secure user registration and login with **JWT (JSON Web Tokens)**.
- Passwords salted and hashed with **bcryptjs** (10 salt rounds).
- Protected API routes with token validation middleware (`auth.js`).
- Complete data isolation — users only access and modify their own financial records.
- Password visibility toggling (Show/Hide) on auth forms.

### 2. 📊 Dynamic Financial Dashboard
- **Instant Metric Cards**: Real-time Net Balance, Monthly Income, Monthly Expenses, and Total Savings.
- **Dynamic Month/Year Filter**: Historical overview across any calendar month.
- **Annual Income vs. Expense Comparison**: Grouped bar chart with interactive dark-themed custom tooltips highlighting Income (Green) and Expense (Red).
- **Cash Flow Trend Line**: 30-day interactive area chart showing spending trajectories.
- **Recent Activity Ledger**: Quick snapshot of the latest transactions with instant status icons.

### 3. 💳 Transaction Management & Analytics
- Complete CRUD operations for income and expenses.
- Categorization with custom icons and color tags.
- **Advanced Filtering**:
  - Search by keyword/title.
  - Type filter (`All`, `Income`, `Expense`).
  - Category selector.
  - Custom Date-Range filter (`Start Date` to `End Date`).
  - Sort by date, amount, or alphabetically.
- **One-Click CSV Export**: Download filtered transactions directly to `.csv` for external analysis.

### 4. 🎯 Category & Budget Management
- Pre-seeded default categories plus full custom category creation.
- Custom color picker and Lucide icon selector.
- Monthly category spending limits with live progress bars.
- Dynamic visual health alerts when spending approaches or exceeds budget thresholds.

---

## 🏆 Bonus & Advanced Capabilities

| Feature | Description |
| :--- | :--- |
| **🔁 Recurring Commitments** | Automated scheduler for recurring expenses (Rent, Netflix, SIP). Checks due dates and processes transactions automatically upon login without relying on fragile server crons. |
| **🎯 Savings Goals** | Target-based goal tracking with milestone progress bars, remaining target calculations, and one-click quick deposits. |
| **📄 Branded PDF Reports** | Professional client-side monthly financial statements using `jsPDF` and `jspdf-autotable`. Includes financial summary, category breakdowns, and complete transaction ledgers. |
| **🌙 Theme Switcher** | Complete Dark Mode and Light Mode support with persistent state stored in `localStorage` and tailored contrast styles. |
| **🔔 Modern Toast System** | Smooth floating notifications powered by `react-hot-toast` replacing intrusive browser alerts. |
| **💱 Multi-Currency Support** | User-configurable global preferred currency (₹ INR, $ USD, € EUR, £ GBP) with live UI-wide propagation. |

---

## 🏗 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite UI                   │
│  (Tailwind CSS • Recharts • jsPDF • React Hot Toast)  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON + JWT)
┌───────────────────────────▼────────────────────────────┐
│                    Express.js Server                   │
│   Auth Middleware • Validators • Business Controllers   │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│                  MongoDB Atlas Cluster                 │
│  Users • Transactions • Categories • Budgets • Goals   │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **PDF Generation**: jsPDF & jsPDF-AutoTable
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM v6

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Encryption**: `bcryptjs`
- **CORS & Environment**: `cors`, `dotenv`

---

## 📁 Folder Structure

```text
finance-tracker/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static assets (logo.png, icons)
│   ├── src/
│   │   ├── components/          # Reusable UI (Sidebar, Layout, Modals)
│   │   ├── context/             # React Context (AuthContext, ThemeContext)
│   │   ├── pages/               # Views (Dashboard, Transactions, Budgets, Goals, etc.)
│   │   ├── utils/               # Helpers (generatePdfReport.js)
│   │   ├── App.jsx              # Routes & Toast Provider
│   │   ├── index.css            # Global CSS & Tailwind styling
│   │   └── main.jsx             # Entry Point
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend API (Node + Express)
│   ├── config/                  # DB connection (db.js)
│   ├── controllers/             # Request handlers (auth, transaction, budget, goal)
│   ├── middleware/              # JWT verification (auth.js)
│   ├── models/                  # Mongoose Schemas (User, Transaction, Budget, Goal, Recurring)
│   ├── routes/                  # API Route declarations
│   ├── utils/                   # Processors (processRecurring.js)
│   ├── package.json
│   └── server.js                # Server entry point
│
├── .gitignore                   # Excludes node_modules, .env, build outputs
└── README.md                    # Project Documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory containing the following:

```env
# Server Configuration
PORT=5000

# Database Connection (MongoDB Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/finance-tracker?retryWrites=true&w=majority

# Security Keys
JWT_SECRET=your_super_secret_jwt_key_here_spendwise_2026

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🛠 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [Git](https://git-scm.com/)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/spendwise-finance-tracker.git
cd spendwise-finance-tracker
```

### 2. Backend Setup
```bash
cd server
npm install
# Create .env and configure your MONGO_URI and JWT_SECRET
npm run dev
```
*The server will start listening at `http://localhost:5000`.*

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The client app will be accessible at `http://localhost:5173`.*

---

## 📡 REST API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Create a new user account & seed defaults | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ |
| `GET` | `/api/auth/profile` | Fetch authenticated user details | ✅ |
| `PUT` | `/api/auth/profile` | Update profile settings (currency, name) | ✅ |

### 💳 Transactions (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/transactions` | Fetch user transactions (with filters) | ✅ |
| `POST` | `/api/transactions` | Record a new transaction | ✅ |
| `PUT` | `/api/transactions/:id` | Update an existing transaction | ✅ |
| `DELETE` | `/api/transactions/:id` | Remove a transaction | ✅ |

### 🎯 Budgets (`/api/budgets`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/budgets` | Fetch monthly category budgets | ✅ |
| `POST` | `/api/budgets` | Set or update a category budget cap | ✅ |
| `DELETE` | `/api/budgets/:id` | Delete a budget cap | ✅ |

### 🔁 Recurring Transactions (`/api/recurring`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/recurring` | List all scheduled recurring rules | ✅ |
| `POST` | `/api/recurring` | Create a new recurring rule | ✅ |
| `PATCH` | `/api/recurring/:id/status`| Pause or resume a recurring rule | ✅ |
| `DELETE` | `/api/recurring/:id` | Remove a recurring rule | ✅ |

### 🏆 Savings Goals (`/api/goals`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/goals` | Fetch all savings targets | ✅ |
| `POST` | `/api/goals` | Create a new savings target | ✅ |
| `POST` | `/api/goals/:id/deposit` | Add saved amount to target | ✅ |
| `DELETE` | `/api/goals/:id` | Remove a savings target | ✅ |

---

## 🚀 Deployment Guide

### Backend on [Render](https://render.com)
1. Create a **New Web Service** connected to your GitHub repository.
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (set to your Vercel frontend URL once deployed)

### Frontend on [Vercel](https://vercel.com)
1. Import your GitHub repository into Vercel.
2. Select **Framework Preset**: Vite
3. Set **Root Directory**: `client`
4. Deploy!

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
