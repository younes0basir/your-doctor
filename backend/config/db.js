const { Pool } = require('pg');
require('dotenv').config();

let pool = null;

function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000
        });

        pool.on('error', (err) => {
            console.error('Unexpected error on idle PostgreSQL client:', err);
        });
    }
    return pool;
}

const DUPLICATE_KEY_CODE = '23505';

function mapPgError(error) {
    if (!error) return error;
    if (error.code === DUPLICATE_KEY_CODE) {
        error.code = 'ER_DUP_ENTRY';
    }
    return error;
}

function convertQuestionPlaceholders(sql) {
    let converted = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let paramIndex = 0;

    for (let i = 0; i < sql.length; i += 1) {
        const char = sql[i];
        const prev = sql[i - 1];

        if (char === "'" && !inDoubleQuote && prev !== '\\') {
            inSingleQuote = !inSingleQuote;
            converted += char;
            continue;
        }

        if (char === '"' && !inSingleQuote && prev !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            converted += char;
            continue;
        }

        if (char === '?' && !inSingleQuote && !inDoubleQuote) {
            paramIndex += 1;
            converted += `$${paramIndex}`;
            continue;
        }

        converted += char;
    }

    return converted;
}

function normalizeResult(sql, result) {
    const command = (result.command || '').toUpperCase();
    const trimmedSql = (sql || '').trim().toUpperCase();
    const isSelectLike = command === 'SELECT' || trimmedSql.startsWith('SELECT');

    if (isSelectLike) {
        return result.rows;
    }

    const payload = {
        affectedRows: result.rowCount || 0
    };

    if (command === 'INSERT') {
        const firstRow = result.rows && result.rows[0] ? result.rows[0] : null;
        if (firstRow && Object.prototype.hasOwnProperty.call(firstRow, 'id')) {
            payload.insertId = firstRow.id;
        } else {
            payload.insertId = null;
        }
    }

    return payload;
}

async function executeQuery(sql, params = []) {
    const parsedSql = convertQuestionPlaceholders(sql);
    const currentPool = getPool();
    const result = await currentPool.query(parsedSql, params);
    return normalizeResult(parsedSql, result);
}

const db = {
    query: (text, params, callback) => {
        const safeParams = Array.isArray(params) ? params : [];
        if (typeof params === 'function') {
            callback = params;
        }

        if (callback) {
            executeQuery(text, safeParams)
                .then((rows) => callback(null, rows, undefined))
                .catch((err) => callback(mapPgError(err)));
            return;
        }

        return executeQuery(text, safeParams);
    },
    promise: () => ({
        query: async (text, params = []) => {
            try {
                const rows = await executeQuery(text, params);
                return [rows, undefined];
            } catch (error) {
                throw mapPgError(error);
            }
        }
    }),
    getConnection: (callback) => {
        getPool().connect()
            .then((client) => {
                callback(null, {
                    release: () => client.release()
                });
            })
            .catch((err) => callback(err));
    },
    on: (event, handler) => {
        getPool().on(event, handler);
    },
    end: () => {
        if (pool) pool.end();
    },
    config: {
        host: process.env.PGHOST || null,
        user: process.env.PGUSER || null,
        database: process.env.PGDATABASE || null
    }
};

module.exports = db;
