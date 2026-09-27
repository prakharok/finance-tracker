# Finance Tracker — MEAN Stack

A full-stack finance tracker with JWT authentication, email OTP verification
(signup, forgot password, and change password), and a transactions dashboard
with filtering, sorting, and server-side pagination.

## Stack
- **M**ongoDB (Mongoose)
- **E**xpress.js (REST API)
- **A**ngular 17 (frontend, NgModule-based)
- **N**ode.js

## Project layout
```
finance-tracker/
├── backend/     Express API, MongoDB models, JWT auth, OTP email
└── frontend/    Angular app (signup, signin, forgot-password, home, profile)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `JWT_SECRET` — any long random string
- `EMAIL_USER` / `EMAIL_PASS` — an SMTP account for sending OTP emails.
  For Gmail: enable 2FA on the account, then create an **App Password**
  (Google Account → Security → App Passwords) and use that as `EMAIL_PASS`.

Run it:
```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```
The API runs on `http://localhost:5000` by default. Check `GET /api/health`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm start
```
This runs `ng serve` on `http://localhost:4200`. It talks to the API URL set
in `src/environments/environment.ts` (defaults to `http://localhost:5000/api`).

## 3. Using the app
1. Go to `/signup`, create an account → an OTP is emailed to you.
2. Enter the OTP to verify your email.
3. Sign in at `/signin` (unverified accounts are blocked from signing in).
4. `/home` — add Income/Expense transactions; filter by type/date range/amount,
   sort by clicking a column header, and page through results.
5. `/profile` — view your username/email, change your password (an OTP is
   emailed to confirm the change), or log out.
6. Forgot your password? `/forgot-password` emails an OTP, then lets you set
   a new one.

## API summary

| Method | Endpoint                              | Auth | Purpose                          |
|--------|----------------------------------------|------|-----------------------------------|
| POST   | /api/auth/signup                       | –    | Create account, sends signup OTP |
| POST   | /api/auth/verify-otp                   | –    | Verify signup / reset OTP        |
| POST   | /api/auth/signin                       | –    | Login, returns JWT               |
| POST   | /api/auth/forgot-password              | –    | Sends reset OTP                  |
| POST   | /api/auth/reset-password               | –    | Set new password with OTP        |
| POST   | /api/auth/request-change-password      | JWT  | Sends change-password OTP        |
| POST   | /api/auth/change-password              | JWT  | Confirms new password with OTP   |
| GET    | /api/profile/me                        | JWT  | Get username/email               |
| POST   | /api/transactions                      | JWT  | Add a transaction                |
| GET    | /api/transactions                      | JWT  | List, with filter/sort/pagination|
| DELETE | /api/transactions/:id                  | JWT  | Delete a transaction             |

`GET /api/transactions` query params: `type`, `dateFrom`, `dateTo`,
`minAmount`, `maxAmount`, `sortBy` (`date`/`amount`/`type`), `order`
(`asc`/`desc`), `page`, `limit`.

## Notes
- Passwords are hashed with bcrypt — never stored or returned in plaintext.
- Routes are protected two ways: the Angular `AuthGuard` blocks navigation to
  `/home` and `/profile` without a token, and the Express `auth` middleware
  rejects API calls without a valid JWT — so both the UI and the API are
  locked down, not just the UI.
- Sign-in OTP was left out by default (marked optional in the spec) to keep
  the login flow to one step; the hook is there in `verifyOtp()` /
  `/api/auth/verify-otp` if you want to add it — reuse the same OTP fields on
  `User` with `otpPurpose: 'signin'`.
