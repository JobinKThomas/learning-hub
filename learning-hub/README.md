# Learning Hub — Phase 0 Foundation

A full-stack learning platform built with **Node.js/Express** + **MongoDB/Mongoose** backend and **React** + **Vite** + **Tailwind CSS** + **Redux Toolkit** frontend.

## Project Structure

```text
learning-hub/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Swagger setup
│   │   ├── controllers/     # Health & Auth controllers
│   │   ├── middlewares/     # Error handling & JWT auth verification
│   │   ├── models/          # User Mongoose model
│   │   ├── routes/          # Express API route declarations
│   │   ├── utils/           # Standardized API response & JWT helpers
│   │   ├── app.js           # Express application configuration
│   │   └── server.js        # Server bootstrap & graceful shutdown
│   ├── tests/               # Health & Auth integration tests
│   └── scripts/             # Local database startup scripts
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance & interceptors
    │   ├── components/      # Navigation bar & Protected Route wrappers
    │   ├── pages/           # Home (/), Login (/login), Register (/register)
    │   ├── store/           # Redux Toolkit store & auth slice
    │   ├── App.jsx          # Route hierarchy
    │   └── main.jsx         # App mounting & providers
    └── vite.config.js       # Vite configuration with /api proxy
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm run db:start   # Starts local MongoDB if needed
npm run dev        # Starts backend server on http://localhost:5000
```

- API Base: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`
- Swagger Docs: `http://localhost:5000/api-docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
```

- Web App: `http://localhost:5173`
- Routes:
  - `/` (System health dashboard, live connection status)
  - `/login` (User login form)
  - `/register` (User registration form)

## Completion Checklist

- [x] Backend running (Express)
- [x] MongoDB connected (Mongoose)
- [x] Frontend running (React + Vite + Tailwind CSS)
- [x] Frontend → Backend communication verified
