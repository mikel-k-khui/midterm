let dbParams = {};
if (process.env.DATABASE_URL) {
  dbParams.connectionString = process.env.DATABASE_URL;
} else {
  dbParams = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  };
}

const { Pool } = require('pg');
const db = new Pool(dbParams);
db.connect();

module.exports = {
  query: (text, params) => {
    const start = Date.now();
    return db.query(text, params)
      .then(res => {
        const duration = Number(Date.now() - start) + 'ms';
        console.log('executed query', { text, params, duration, rows: res.rowCount });
        return res;
      }).catch(err => console.error('query error', err.stack));
  },
};
