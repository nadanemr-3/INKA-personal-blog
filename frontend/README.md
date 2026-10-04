# INKA Frontend

React 19 + Vite 8 single-page application for the INKA personal blog / digital magazine.

## Commands

```bash
npm install   # install dependencies
npm run dev   # start dev server (http://localhost:5173)
npm run lint  # oxlint
npm run build # production build into dist/
npm run preview # preview the production build
```

## Configuration

Copy `.env.example` to `.env` (never commit `.env`):

| Variable       | Value                       |
| -------------- | --------------------------- |
| `VITE_API_URL` | `http://localhost:5000/api` |

## Structure

- `src/pages/` — Home, Journal, StoryDetails, CreateStory, EditStory, MyStories, Login, Register, About
- `src/components/` — Navbar, StoryCard (5 editorial variants), StoryList, Button, Input, ProtectedRoute
- `src/context/` + `src/hooks/` — JWT auth state (`useAuth`)
- `src/services/api.js` — centralized Axios instance; attaches the Bearer token automatically
- `src/index.css` — editorial design system, CSS motion utilities, responsive rules, accessibility styles

Public routes: `/`, `/journal`, `/stories/:id`, `/about`, `/login`, `/register`.
Protected routes (require login): `/write`, `/edit/:id`, `/my-stories`.

See the root `README.md` for backend, database, API, and auth documentation.
