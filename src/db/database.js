require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: isProduction ? null : process.env.PG_USER,
  host: isProduction ? null : process.env.PG_HOST,
  database: isProduction ? null : process.env.PG_DATABASE,
  password: isProduction ? null : process.env.PG_PASSWORD,
  port: isProduction ? null : process.env.PG_PORT,
  connectionString: isProduction ? process.env.DATABASE_URL : null,
  ssl: isProduction ? { rejectUnauthorized: false } : null,
});

const queries = {
    getAllProperties: () => {
        return pool.query('SELECT * FROM property');
    },
    insertProperty: (address) => {
        return pool.query('INSERT INTO property (address) VALUES ($1)', [address]);
    },
    deletePropertyById: (id) => {
        return pool.query('DELETE FROM property WHERE id = $1', [id]);
    },
    getPropertyById: (id) => {
        return pool.query('SELECT * FROM property WHERE id = $1', [id]);
    },
    deletePropertyByAddress: (address) => {
        return pool.query('DELETE FROM property WHERE address = $1', [address]);
    },
    getPropertyByAddress: (address) => {
        return pool.query('SELECT * FROM property WHERE address = $1', [address]);
    }
};


module.exports = {
    pool,
    queries
};