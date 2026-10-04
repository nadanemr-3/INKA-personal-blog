# INKA — Personal Blog

A personal space where ideas, experiences, and stories become articles.

INKA is a full-stack personal blog and digital magazine built with React, Express, and MySQL/MariaDB. Stories are presented as editorial magazine pieces with distinct card variants, a motion system, responsive layouts, and accessibility polish.

---

## Tech Stack

**Frontend:** React 19, React Router 7, Axios, Vite 8, oxlint
**Backend:** Node.js, Express 5, mysql2, jsonwebtoken, bcryptjs, Multer, cors, dotenv
**Database:** MySQL / MariaDB (InnoDB)
**Authentication:** JWT (Bearer) + bcrypt password hashing
**Image Upload:** Multer (local disk, `backend/uploads/`)

---

## Project Structure

```
inka-personal-blog/
├── frontend/
│   ├── public/            → static assets (favicon)
│   ├── src/
│   │   ├── assets/        → bundled assets
│   │   ├── components/    → Navbar, StoryCard, StoryList, Button, Input, ProtectedRoute
│   │   ├── context/       → AuthContext (user + token state)
│   │   ├── hooks/         → useAuth
│   │   ├── pages/         → Home, Journal, StoryDetails, CreateStory,
│   │   │                    EditStory, MyStories, Login, Register, About
│   │   ├── services/      → api.js (centralized Axios instance + endpoints)
│   │   ├── App.jsx        → routes, layout, skip link, route-focus management
│   │   ├── main.jsx       → React entry point
│   │   └── index.css      → editorial design system, motion, responsive, a11y styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── config/db.js       → mysql2 promise pool
│   ├── controllers/       → authController, postController
│   ├── middleware/        → authMiddleware (JWT), uploadMiddleware (Multer)
│   ├── routes/            → authRoutes, postRoutes
│   ├── uploads/           → cover images served statically at /uploads
│   ├── server.js          → app bootstrap, CORS, static serving, health check
│   └── package.json
└── README.md
```

---

## Prerequisites

- Node.js (LTS) and npm
- MySQL or MariaDB listening on `localhost:3306` (e.g. XAMPP on Windows)

---

## Setup

### 1. Database

Create the database (tables are expected by the backend; no migration runner is included):

```sql
CREATE DATABASE personal_blog;
```

Expected tables (reference — do not modify while the app is running):

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id)
);
```

### 2. Environment variables

Copy each example file to `.env` (never commit `.env`):

- `frontend/.env.example` → `frontend/.env`

  | Variable     | Example value               |
  | ------------ | --------------------------- |
  | `VITE_API_URL` | `http://localhost:5000/api` |

- `backend/.env.example` → `backend/.env`

  | Variable      | Example value              |
  | ------------- | -------------------------- |
  | `PORT`        | `5000`                     |
  | `DB_HOST`     | `localhost`                |
  | `DB_USER`     | `root`                     |
  | `DB_PASSWORD` | *(empty for local XAMPP)*  |
  | `DB_NAME`     | `personal_blog`            |
  | `JWT_SECRET`  | *(long random local value)*|
  | `CORS_ORIGIN` | `http://localhost:5173`    |

### 3. Install and run

```bash
# Backend (http://localhost:5000)
cd backend
npm install
node server.js        # or: npm run dev (nodemon)

# Frontend (http://localhost:5173) — in a second terminal
cd frontend
npm install
npm run dev
```

Successful backend startup logs `Database connected successfully`.

### 4. Frontend checks

```bash
cd frontend
npm run lint    # oxlint
npm run build   # production build into dist/
npm run preview # preview the production build
```

---

## API Reference

Base URL: `http://localhost:5000/api`. Health check: `GET /` → `{"message":"INKA API is running"}`.

### Auth (`/api/auth`, public)

| Method | Path              | Body                          | Success            |
| ------ | ----------------- | ----------------------------- | ------------------ |
| POST   | `/auth/register`  | `{ name, email, password }`   | 201 `{ message, token, user }` |
| POST   | `/auth/login`     | `{ email, password }`         | 200 `{ message, token, user }` |

`user` is always `{ id, name, email }` — password hashes are never returned.

### Posts

| Method | Path          | Auth | Notes                                              |
| ------ | ------------- | ---- | -------------------------------------------------- |
| GET    | `/posts`      | No   | All posts, newest first, with `author_name`        |
| GET    | `/posts/:id`  | No   | Single post; 400 invalid ID, 404 unknown ID        |
| POST   | `/posts`      | JWT  | `{ title, content }` + optional `image` multipart  |
| PUT    | `/posts/:id`  | JWT  | Owner only (403 otherwise); optional image replace |
| DELETE | `/posts/:id`  | JWT  | Owner only (403 otherwise); removes image file     |

Uploads accept JPEG/PNG/WebP/GIF up to 5 MB and are served at `/uploads/<file>`.

---

## Authentication Flow

1. `Login`/`Register` pages call `AuthContext.login/register`, which POST to `/api/auth/*`.
2. The backend verifies credentials with bcrypt, signs a 24 h JWT, and returns `{ token, user }`.
3. The frontend stores `inka_token`/`inka_user` in `localStorage` (passwords are never stored).
4. The Axios instance in `services/api.js` attaches `Authorization: Bearer <token>` to every request.
5. `ProtectedRoute` guards `/write`, `/edit/:id`, and `/my-stories`; `authMiddleware` re-verifies the token server-side and post ownership is enforced in `postController` (403 for non-owners).
6. Logout clears both `localStorage` keys.

---

## Frontend Notes

- **Routes:** `/` Home, `/journal`, `/stories/:id`, `/about`, `/login`, `/register` (public); `/write`, `/edit/:id`, `/my-stories` (protected); unknown paths render Home.
- **Design system** (`index.css`): cream/pink/yellow/sky editorial palette, Fraunces display + Plus Jakarta Sans body, five `StoryCard` variants (featured, secondary, thought, visual, standard) composed by `StoryList` into magazine sections.
- **Motion:** CSS-only keyframes/utilities (`motion-fade-up`, `motion-scale-in`, stagger classes) with `prefers-reduced-motion` support.
- **Responsive:** desktop ≥ 1024 px, tablet 768–1023 px, mobile < 768 px with an accessible hamburger menu.
- **Accessibility:** skip link, single-`main` landmarks, route-change focus management, labeled inputs with error announcements, 44 px touch targets on mobile.

---

## Security Notes

- All SQL uses parameterized queries; auth/error responses never leak hashes, SQL, paths, or stack traces.
- `X-Powered-By` is disabled; CORS defaults to `http://localhost:5173` and is configurable via `CORS_ORIGIN`.
- No rate limiting or security-header suite is installed — see project roadmap before exposing this deployment publicly.

---

## License

This project is for educational purposes.
