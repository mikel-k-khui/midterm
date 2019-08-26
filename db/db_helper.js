// a file within it and make all interactions with the database go through this file
//per node-postgres guides https://node-postgres.com/guides/project-structure
// PG database client/connection setup
// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT     = process.env.PORT || 8080;
const ENV      = process.env.ENV || "development";
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

module.exports = {
  query: (text, params) => {
    return pool.query(text, params)
      .then(res => {
        return res.rows;
      })
      .catch(err => {
        return Promise.reject(null);
      });
  },

  idQuery: (text, params) => {
    return pool.query(text, params)
      .then(res => {
       return res.rows[0] === undefined ? null : res.rows[0];
      })
     .catch(err => {
        return Promise.reject(null);
      });
  },
};
