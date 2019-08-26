/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/:userid", (req, res) => {
    const userID = req.params.userid;
    const categories = ['eat', 'buy', 'read', 'watch'];
    const queryString = 'SELECT tasks.description, tasks.category, to_char(tasks.last_modified, \'DD Mon YYYY\') AS last_modified FROM tasks JOIN users on user_id = users.id WHERE users.id = $1 AND category = $2 ORDER BY category;';
    let eatArr = [];
    let buyArr = [];
    let readArr = [];
    let watchArr = [];
    const eat = db.query(queryString, [userID, categories[0]])
      .then(res => eatArr = res.rows);
    const buy = db.query(queryString, [userID, categories[1]])
      .then(res => buyArr = res.rows);
    const read = db.query(queryString, [userID, categories[2]])
      .then(res => readArr = res.rows);
    const watch = db.query(queryString, [userID, categories[3]])
      .then(res => watchArr = res.rows);

    Promise.all([eat, buy, read, watch]).then(() => {
      const templateVars = {
        user: userID,
        eats: eatArr,
        buys: buyArr,
        reads: readArr,
        watches: watchArr
      };
        // console.log(templateVars);
      res.render('index', templateVars);
    }).catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

  });

  return router;
};
