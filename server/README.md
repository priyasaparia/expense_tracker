# Expense Tracker - Backend

This folder contains a Node.js + Express backend that connects to MongoDB.

Features
- Authentication (signup/login) using JWT
- Expense CRUD (per-user)
- Mongoose models for `User` and `Expense`

Quick setup (Windows)

1. Install MongoDB locally or use Docker (instructions below).

2. Copy `.env.example` to `.env` and update values if needed.

3. Install dependencies and start server:

```bash
cd "c:\Users\piusa\OneDrive\Desktop\myproject\expense tracker\server"
npm install
npm run dev # requires nodemon, or npm start
```

4. Seed sample data (optional):

```bash
node seed.js
```

Endpoints
- POST `/api/auth/signup`  { name, email, password }
- POST `/api/auth/login`   { email, password }
- GET  `/api/auth/me`      (Authorization: Bearer <token>)
- GET  `/api/expenses`     (Authorization)
- POST `/api/expenses`     (Authorization, body expense)
- PUT  `/api/expenses/:id` (Authorization)
- DELETE `/api/expenses/:id` (Authorization)

Local MongoDB (Windows)
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community and follow the installer.
2. Start MongoDB service (Windows): open Services and start `MongoDB` or run:

```powershell
net start MongoDB
```

Using Docker (alternative)

```bash
docker run -d --name mongodb -p 27017:27017 -v mongodata:/data/db mongo:6
```

Testing API quickly

1. After server is running, test ping:

```bash
curl http://localhost:5000/api/ping
```

2. Create an account via `POST /api/auth/signup` and log in to get a JWT.

Frontend integration
- Update frontend API calls to use `http://localhost:5000/api/...` and send `Authorization: Bearer <token>` header for protected routes.

Notes
- The `MONGODB_URI` defaults to `mongodb://127.0.0.1:27017/expense-tracker`.
- For production, host MongoDB in a managed service and protect your `JWT_SECRET`.
