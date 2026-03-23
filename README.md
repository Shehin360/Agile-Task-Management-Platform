# Sprintly - Agile Task Management Platform

Sprintly is an Angular + FastAPI project for task planning with a dynamic Kanban board, local authentication, optional Google sign-in (Firebase), and an analytics dashboard.

## Current Project Scope

### Frontend

- Routes: login, register, board, analytics
- Route guards on board and analytics
- Local auth state and registered users persisted in localStorage
- Google sign-in via Firebase Auth SDK (loaded from CDN)
- Dynamic column management:
  - add column
  - rename column
  - delete column (with fallback task move when possible)
  - drag-and-drop column reordering
- Task management:
  - create / edit / delete
  - drag-and-drop across columns
  - reorder inside a column
  - due date
  - priority (low / medium / high)
  - optional image attachment (stored as Data URL)
- Analytics page using board data from localStorage:
  - quick stats
  - column donut chart
  - priority distribution
  - due-date status gauge
  - task timeline
  - attention list

### Backend

FastAPI endpoints exist for task, column, and auth/profile operations.

## Important Data Flow Note

The current source of truth for board/analytics data is localStorage on the frontend.

The frontend still calls backend endpoints for create/update/delete and auth/profile events, but board rendering and analytics metrics are computed from locally persisted state.

## Tech Stack

### Frontend

- Angular 21
- TypeScript
- Angular animations
- Angular HttpClient
- Angular signals/computed

### Backend

- FastAPI
- Uvicorn
- Pydantic

## Project Structure

```text
agile_project/
  backend/
    FastAPI.py
    requirements.txt
  public/
  src/
    app/
      analytics/
      auth/
      kanban/
      login/
      register/
      app.routes.ts
    environments/
      firebase.config.example.ts
      firebase.config.local.ts   # local only, gitignored
    index.html
  angular.json
  package.json
  README.md
```

## Prerequisites

- Node.js 18+
- npm
- Python 3.10+

## Frontend Setup

From project root:

```bash
npm install
```

## Firebase Setup (Sensitive Config Moved Out)

Firebase keys were moved out of source code into a local file.

1. Create your local config from the example:

```bash
cp src/environments/firebase.config.example.ts src/environments/firebase.config.local.ts
```

2. Put your Firebase Web App values in:

- src/environments/firebase.config.local.ts

3. This file is ignored by git and should not be committed.

## Run Frontend

```bash
npm start
```

Frontend URL:

- http://localhost:4200

## Backend Setup And Run

- Please copy the FastAPI.py file and the requirements.txt file outside the frontend folder which is the ideal choice

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn FastAPI:app --reload --port 8000
```

Backend URL:

- http://localhost:8000

Current backend CORS allowlist includes:

- http://localhost:4200

## Available Frontend Scripts

From package.json:

- npm start -> ng serve
- npm run build -> ng build
- npm run watch -> ng build --watch --configuration development
- npm test -> ng test
- npm run serve:ssr:newproject -> node dist/newproject/server/server.mjs

## FastAPI Endpoints Currently Implemented

### Task

- POST /create_task
- PUT /update_task
- DELETE /delete_task

### Column

- POST /create_column
- PUT /update_column
- DELETE /delete_column

### Auth and Profile

- POST /login
- POST /google_login
- POST /register
- POST /logout
- PUT /update_profile

## Team Sharing Notes

- Keep src/environments/firebase.config.local.ts private.
- Each teammate should create the api credentials from Firebase on there own
- Share src/environments/firebase.config.example.ts as the template.
- Each teammate should create their own local firebase.config.local.ts.

## Troubleshooting

### Frontend install/run issues

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port 4200 already in use

```bash
npx ng serve --port 4300
```

### Backend dependency issues

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

## Extra Notes

- Firebase SDK scripts are loaded in src/index.html.
- Analytics currently reads from localStorage snapshots shared with board state.
