# Insight-Ink

An Express + EJS + MongoDB blog platform with JWT cookie authentication, post interactions (likes/comments/replies), notifications, and an admin/super-admin portal.

---

## Features

- **Authentication** (JWT stored in an **httpOnly cookie**)
  - Register / Login / Logout
  - Protected HTML pages: **Profile**, **Inbox**, **Write**, **Edit**
  - Role-based access: `user`, `admin`, `superadmin`
- **Posts**
  - Create, read, edit, delete
  - **Like** / **Comment** / **Reply**
  - Public endpoints for viewing posts
- **Notifications**
  - Create notifications for certain admin actions (e.g., deletions, promotions)
  - Inbox UI + API endpoints
- **Activity logging**
  - Records page views and important user actions to `ActivityLog`
- **Admin / Super-admin portal**
  - View metrics and recent activity
  - Promote users to admin
  - Send notices to users (and attempt email delivery via Nodemailer)

---

## Tech stack

- Node.js
- Express
- EJS
- MongoDB + Mongoose
- JWT (cookie-based)
- Nodemailer (SMTP)

---

## Project structure (high level)

- `server.js` - app bootstrap, middleware, routes
- `config/`
  - `db.js` - MongoDB connection
  - `mailer.js` - Nodemailer transporter
- `controllers/`
  - `authController.js` - auth + renders
  - `postController.js` - posts + interactions
  - `notificationController.js` - inbox endpoints
  - `adminController.js` - super-admin portal
  - `mailController.js` - contact email endpoint
- `middleware/`
  - `auth.js` - `protect` and `authorize`
  - `activity.js` - page view tracking
- `routes/` - route wiring
- `views/` - EJS templates
- `models/` - Mongoose models

---

## Environment variables (.env)

Create a `.env` file in the project root.

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/insight-ink

# JWT
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# SMTP (used for sending admin notices and contact form emails)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false   # set true if using port 465
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Mail routing
SMTP_FROM=your-from-email
MAIL_TO=destination-email-or-inbox
```

Notes:
- If SMTP variables are not fully configured, email sending will fail, but the app can still run.
- JWT is stored in a cookie named **`token`**.

---

## Installation

```bash
npm install
```

---

## Running the app

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## API endpoints

### Auth

- `POST /api/register` - `{ name, email, password }`
- `POST /api/login` - `{ email, password }`
- `GET /logout` - clears `token` cookie (HTML redirect to `/login`)
- `PUT /api/profile` - update profile (multipart/form-data or JSON)

### Posts

Protected (requires auth):
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comment`
- `PUT /api/posts/:id/comment/:commentId`
- `DELETE /api/posts/:id/comment/:commentId`
- `POST /api/posts/:id/reply`

Public:
- `GET /api/posts`
- `GET /api/posts/:id`

### Notifications

Protected (requires auth):
- `GET /api/notifications` - latest notifications (JSON)
- `PUT /api/notifications/:id/read` - marks as read

### Mail (contact)

- `POST /api/mail/send`
  - body: `{ name, email, subject, message }`

### Admin / Super-admin

- `GET /super-admin`
- `POST /super-admin/users/:id/promote`
- `POST /super-admin/users/:id/notice`

---

## HTML routes

These routes render EJS views:

- `GET /` - posts list
- `GET /login` - login page
- `GET /register` - register page
- `GET /profile` - protected
- `GET /inbox` - protected notifications
- `GET /post/:id` - single post
- `GET /write` - protected write page
- `GET /edit/:id` - protected edit page
- `GET /super-admin` - super-admin portal

---

## Testing / smoke harness

A deep smoke test harness exists at:

- `test_harness/runDeepTest.js`

Usage:

```bash
# ensure the server is running and env vars are set
node test_harness/runDeepTest.js
```

This harness performs:
- basic HTML render checks
- auth flow checks
- post CRUD-ish API flow checks
- notifications/inbox checks
- outputs `deep_test_report.json` (or `DEEP_TEST_REPORT_PATH` if set)

---

## Security notes

- JWT verification is done via `JWT_SECRET`.
- `token` cookie is configured as `httpOnly`.
- `authorize()` allows access for specific roles; `superadmin` bypasses role checks.

---

## Author

- **faith tolu**

