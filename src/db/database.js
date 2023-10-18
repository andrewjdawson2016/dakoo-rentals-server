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

// TODO: write tests for this
const getLeaseEvents = (startDate, endDate) => {
    const eventDates = [
        { date: formatDateToYYYYMMDD(startDate), description: 'start of lease' },
        { date: formatDateToYYYYMMDD(endDate), description: 'end of lease' },
    ];
    const sixMonthsBeforeEnd = subMonths(endDate, 6);
    const twoMonthsBeforeEnd = subMonths(endDate, 2);
    const oneMonthBeforeEnd = subMonths(endDate, 1);

    if (sixMonthsBeforeEnd > startDate) eventDates.push({date: formatDateToYYYYMMDD(sixMonthsBeforeEnd), description: 'send renewal option at 6 months'});
    if (twoMonthsBeforeEnd > startDate) eventDates.push({date: formatDateToYYYYMMDD(twoMonthsBeforeEnd), description: 'send renewal reminder at 2 months'});
    if (oneMonthBeforeEnd > startDate) eventDates.push({date: formatDateToYYYYMMDD(oneMonthBeforeEnd), description: 'renewal deadline'});

    return eventDates;
};

const getDaysInMonth = (inputDate) => {
    return new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0).getDate()
};

const isLastDayOfMonth = (inputDate) => {
    const date = new Date(inputDate);
    date.setDate(date.getDate() + 1);
    return date.getDate() === 1;
  };

const subMonths = (inputDate, months) => {
  const date = new Date(inputDate)
  date.setDate(1)
  date.setMonth(date.getMonth() - months)
  const lastDay = getDaysInMonth(date);
  if (isLastDayOfMonth(inputDate)) {
    date.setDate(lastDay);
  } else {
    date.setDate(Math.min(inputDate.getDate(), lastDay));
  }
  return date
}

const formatDateToYYYYMMDD = (inputDate) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = {
    pool,
    propertyQueries,
    leaseQueries
};