require('dotenv').config();
const { Pool } = require('pg');
const { DateTime } = require("luxon");

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

const propertyQueries = {
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
    }
}

const leaseQueries = {
    getAllLeases: () => {
        return pool.query('SELECT * FROM lease');
    },
    getLeaseById: (id) => {
        return pool.query('SELECT * FROM lease WHERE id = $1', [id]);
    },
    insertLease: (property_id, start_date, end_date, price_per_month) => {
        return pool.query('INSERT INTO lease (property_id, start_date, end_date, price_per_month) VALUES ($1, $2, $3, $4)', 
          [property_id, start_date, end_date, price_per_month]);
    },
    deleteLeaseById: (id) => {
        return pool.query('DELETE FROM lease WHERE id = $1', [id]);
    }
}

const createLeaseWithNoteAndEvents = async (property_id, start_date, end_date, price_per_month, note) => {
    await pool.query('BEGIN');

    try {
        const leaseQueryText = 'INSERT INTO lease(property_id, start_date, end_date, price_per_month) VALUES($1, $2, $3, $4) RETURNING id';
        const leaseValues = [property_id, start_date, end_date, price_per_month];
        const leaseResult = await pool.query(leaseQueryText, leaseValues);
        const leaseId = leaseResult.rows[0].id;

        if (note) {
            const noteQueryText = 'INSERT INTO lease_note (lease_id, note) VALUES ($1, $2)';
            const noteValues = [leaseId, note];
            await pool.query(noteQueryText, noteValues);
        }

        const events = getLeaseEvents(new Date(start_date + "T00:00"), new Date(end_date + "T:00:00"));
        for (let event of events) {
            const eventQueryText = 'INSERT INTO lease_event (lease_id, due_date, description) VALUES ($1, $2, $3)';
            const eventValues = [leaseId, event.date, event.description];
            await pool.query(eventQueryText, eventValues);
        }

        await pool.query('COMMIT');
        return leaseId;
    } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
    }
};

module.exports = {
    pool,
    propertyQueries,
    leaseQueries
};