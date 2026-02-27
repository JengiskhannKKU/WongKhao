import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { closeNeo4j, hasNeo4jConfig, verifyNeo4j } from './neo4j.js';
import crudRouter from './routes/crud.js';
import behaviorRouter from './routes/behavior.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

app.use('/api/behavior', behaviorRouter);
app.use('/api', crudRouter);

app.get('/health', async (_req, res) => {
    let neo4jReady = false;

    if (hasNeo4jConfig()) {
        try {
            await verifyNeo4j();
            neo4jReady = true;
        } catch {
            neo4jReady = false;
        }
    }

    res.json({
        status: 'ok',
        neo4jConfigured: hasNeo4jConfig(),
        neo4jReady,
    });
});

const server = app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});

async function shutdown() {
    server.close(async () => {
        await closeNeo4j();
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
