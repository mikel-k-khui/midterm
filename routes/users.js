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

  //route to post a new task to an existing user
  router.post("/:user_id/add-task", function(req, res) {
    console.log("Inputs:", req.body);
    // const user_id = req.session.userId;
    const user_id = 2;
    const list_name = 'To eat';
    // db.userExists( {id: user_id})
    //   .catch(console.log("User does not exist!");)
      // .then(user => getListId({created_by: user.rows[user_id], name: list_name})
    db.getListId({user_id, list_name})
      .catch(
        console.log(`List not found!`))
      .then(users_lists => addTask({...req.body, users_lists: users_lists.rows[0]}))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
    });

  return router;
};
