# Student Expense Tracker

Full-stack web application: **Next.js** (React) frontend and **Laravel** (PHP) API with MySQL/SQLite. Students can register, log in, and track expenses by category with a dashboard and charts.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend:** Laravel 12, PHP 8.2+, Laravel Sanctum (API tokens)
- **Database:** SQLite (local) or MySQL (e.g. mi-linux.wlv.ac.uk)

## Quick start (local)

### Backend

```bash
cd backend
cp .env.example .env   # if not already
php artisan key:generate
# SQLite: ensure database/database.sqlite exists (touch database/database.sqlite)
php artisan migrate
php artisan serve
```

API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # or create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

App runs at `http://localhost:3000`. Open it, register a user, then add expenses and view the dashboard.

## Project structure

- `backend/` – Laravel API (auth, categories, transactions, summary)
- `frontend/` – Next.js app (login, register, dashboard, transactions, categories)

## API (Laravel)

- `POST /api/register` – register (name, email, password, password_confirmation)
- `POST /api/login` – login (email, password) → returns `token` and `user`
- `POST /api/logout` – logout (Bearer token)
- `GET /api/user` – current user (Bearer token)
- `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/{id}` – categories (scoped to user)
- `GET/POST /api/transactions`, `GET/PUT/DELETE /api/transactions/{id}` – transactions (scoped to user)
- `GET /api/transactions/summary` – dashboard summary (total this month, by category, recent)

## Deployment

- **Backend:** Deploy Laravel to mi-linux.wlv.ac.uk (PHP, MySQL). Set `.env` with `DB_*` for MySQL and run `php artisan migrate`.
- **Frontend:** Set `NEXT_PUBLIC_API_URL` to the backend URL (e.g. `https://mi-linux.wlv.ac.uk/your-api`). Build with `npm run build` and serve or host on Vercel/Netlify.

## Version control

Commit both `frontend/` and `backend/` regularly (e.g. weekly) to Git.
