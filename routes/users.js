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

  // set cookie when logging in; to be implemented later
  // router.get('/login/:id', (req, res) => {
  //   req.session.user_id = req.params.id;
  //   res.redirect('/');
  // });

  router.get("/:userid", (req, res) => {
    const userID = req.params.userid;
    db.query('SELECT * FROM users WHERE id = $1;', [userID])
      .then(data => {
        const user = data.rows[0];
        const templateVars = {
          user: user
        };
        // console.log(user);
        res.render('index', templateVars);
        // res.json({ user });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  return router;
};
