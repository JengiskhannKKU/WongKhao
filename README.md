# WongKhao

Thai food recommendation app (React + Vite) with backend API (Express + Prisma) and Neo4j AuraDB behavior analytics.

## What Neo4j tracks

The backend writes user behavior to Neo4j with these graph relations:

- `(:User)-[:SWIPED]->(:Food)`
- `(:User)-[:ADJUSTED_RECIPE]->(:Food)`
- `(:User)-[:LOGGED_MEAL]->(:Food)`
- `(:User)-[:PREFERS_REGION]->(:Region)`
- `(:User)-[:HAS_GOAL]->(:HealthGoal)`

Behavior endpoints:

- `POST /api/behavior/user-profile`
- `POST /api/behavior/swipe`
- `POST /api/behavior/adjustment`
- `POST /api/behavior/meal-log`
- `GET /api/behavior/insights/:userId`

## Neo4j AuraDB setup

1. Create a Neo4j AuraDB instance at https://console.neo4j.io
2. Open your instance and copy the **Connection URI**.
3. URI format must be `neo4j+s://...databases.neo4j.io`.
4. Username is usually `neo4j`.
5. Password is the one you set when creating the instance.
- If forgotten, use Aura console `...` menu -> `Reset credentials`.

Put values in `backend/.env`:

```bash
PORT=3001
CORS_ORIGIN=http://localhost:5173
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

For deployed frontend (e.g. Vercel), set `CORS_ORIGIN` to your frontend URL:

```bash
CORS_ORIGIN=https://wong-khao.vercel.app
# Optional for Vercel preview URLs:
# CORS_ALLOW_VERCEL_PREVIEWS=true
```

## Local setup

Frontend env (`.env` at project root):

```bash
VITE_OPENAI_API_KEY=
VITE_BACKEND_BASE_URL=http://localhost:3001
VITE_BEHAVIOR_TRACKING_ENABLED=true
```

For deployed frontend, `VITE_BACKEND_BASE_URL` must point to your public backend URL (not `localhost`).

Install and run frontend:

```bash
npm install
npm run dev
```

Install and run backend:

```bash
cd backend
npm install
npm run dev
```

## Check Neo4j connection

Backend health:

```bash
curl http://localhost:3001/health
```

You should see:

- `neo4jConfigured: true`
- `neo4jReady: true`

## Query behavior insights

Get insights for a user:

```bash
curl http://localhost:3001/api/behavior/insights/<userId>
```

Response includes:

- swipe breakdown (like/dislike/save)
- top liked foods
- top disliked foods
- preferred regions
- recipe adjustment patterns
- meal summary (sodium saved, points earned)
