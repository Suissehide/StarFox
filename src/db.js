import mysql from 'mysql';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let con = createConnection();

function createConnection() {
    const connection = mysql.createConnection({
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT,
        user:     process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    connection.connect((err) => {
        if (err) {
            console.error('DB connection error:', err.message);
            scheduleReconnect();
            return;
        }
        console.log('DB connection established');
    });

    connection.on('error', (err) => {
        console.error('DB error:', err.message);
        scheduleReconnect();
    });

    return connection;
}

function scheduleReconnect() {
    setTimeout(() => {
        console.log('Reconnecting to DB...');
        con = createConnection();
    }, 2000).unref(); // .unref() so tests and the process can exit cleanly
}

/**
 * Returns the current global click count.
 * Resolves with a number; rejects on DB error.
 */
export function getClicks() {
    return new Promise((resolve, reject) => {
        con.query('SELECT click FROM abacus LIMIT 1', (err, results) => {
            if (err) return reject(err);
            resolve(results[0]?.click ?? 0);
        });
    });
}

/**
 * Persists the given click count to the DB.
 * Errors are logged and swallowed — clicks remain safe in memory.
 */
export function persistClicks(value) {
    con.query('UPDATE abacus SET click = ? LIMIT 1', [value], (err) => {
        if (err) console.error('Failed to persist clicks:', err.message);
    });
}
