# Sprintly - Agile Task Management Platform

Sprintly is an Angular frontend with a FastAPI backend for Kanban-style task management, authentication, and analytics.

## What Is Included

- Login and register pages
- Protected board and analytics routes
- Dynamic Kanban columns (add, rename, delete, reorder)
- Task CRUD, drag-and-drop, priority, due date, optional image
- Analytics dashboard (reads board state)
- Firebase Google sign-in integration
- FastAPI endpoints for auth, tasks, and columns

## Important Data Flow

- Board and analytics data are currently stored in browser localStorage.
- The frontend also sends API calls to FastAPI for operations.

## Project Structure

```text
agile_project/
  backend/
    FastAPI.py
    requirements.txt
  src/
    app/
      auth/
      kanban/
      analytics/
      login/
      register/
    environments/
      firebase.config.example.ts
      firebase.config.local.ts
  package.json
  README.md
```

## Prerequisites

- Node.js 18+
- npm
- Python 3.10+

## Setup For A New Teammate

1. Clone the repository.
2. Open a terminal in the project root (`agile_project`).
3. Install frontend dependencies:

```bash
npm install
```

4. Create local Firebase config from template:

```bash
cp src/environments/firebase.config.example.ts src/environments/firebase.config.local.ts
```

5. Open `src/environments/firebase.config.local.ts` and paste your Firebase web app values.

## Run The Frontend

From project root:

```bash
npm start
```

Frontend URL:

- http://localhost:4200

## Run The Backend

Make sure `FastAPI.py` and `requirements.txt` are copied and put it outside the agile_project folder and make new folder by `mkdir backend/` then `cd backend` which need to be created seperatedly and paste the `FastAPI.py` and `requirements.txt` there

```bash
# cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn FastAPI:app --reload --port 8000
```

Backend URL:

- http://localhost:8000

## Typical Day-To-Day Workflow

1. Start backend terminal:

```bash
cd backend
source .venv/bin/activate
uvicorn FastAPI:app --reload --port 8000
```

2. Start frontend terminal:

```bash
npm start
```

3. Open http://localhost:4200

## Frontend Scripts

- `npm start` -> `ng serve`
- `npm run build` -> `ng build`
- `npm run watch` -> `ng build --watch --configuration development`
- `npm test` -> `ng test`
- `npm run serve:ssr:newproject` -> serves SSR output

## Backend Requirements

From `backend/requirements.txt`:

- fastapi==0.135.0
- uvicorn==0.41.0
- pydantic==2.12.5

## API Endpoints

Auth and profile:

- POST `/login`
- POST `/google_login`
- POST `/register`
- POST `/logout`
- PUT `/update_profile`

Tasks:

- POST `/create_task`
- PUT `/update_task`
- DELETE `/delete_task`

Columns:

- POST `/create_column`
- PUT `/update_column`
- DELETE `/delete_column`

## Team Sharing Notes

- Do not commit `src/environments/firebase.config.local.ts`.
- Share only `src/environments/firebase.config.example.ts` as the template.
- Each teammate should create their own Firebase API credentials and local config file on their machine.

## Troubleshooting

Frontend install issues:

```bash
rm -rf node_modules package-lock.json
npm install
```

Frontend port already in use:

```bash
npx ng serve --port 4300
```

Backend dependency issues:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```
