// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const bcrypt     = require('bcrypt');
const cookieParser = require('cookie-parser');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Postgres SQL files
// const { addTask } = require('./db/db_queries');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

app.use(cookieParser());

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

/* Start of DELETE queries */
app.delete(":user_id/:task/:category", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/');
  }
  console.log("Delete all tasks in category");
  let queryStr = `DELETE FROM tasks WHERE user_id=$1 AND category=$2 RETURNING *;
  `;
  db.query(queryStr, [req.cookies["user_id"], req.params.category])
    .then(result => {
      if(result.rows[0] === undefined) {
        // delete not successful
      }
    })
    .catch(e => res.send(e));
});

app.delete(":user_id/:task/", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/');
  }
  console.log("Delete task");
  let queryStr = `DELETE FROM tasks WHERE user_id=$1 AND id=$2 RETURNING *;
  `;
  db.query(queryStr, [req.cookies["user_id"], req.params.task])
    .then(result => {
      if(result.rows[0] === undefined) {
        // delete not successful
      }
    })
    .catch(e => res.send(e));
});

app.delete(":user_id/", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/');
  }

  console.log("Delete user");

  let queryStr = `DELETE FROM users WHERE user=$1 RETURNING *;
  `;
  db.query(queryStr, [req.cookies["user_id"]])
    .then(result => {
      if(result.rows[0] === undefined) {
        // delete not successful
      }
    })
    .catch(e => res.send(e));
});

/* Start of GET queries */
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  // if (req.cookies["user_id"]) {
  //   console.log(req.cookies["user_id"], "cookies");
  // }
  res.render("index");
});

app.get("/login/:user_id", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/');
  }
  let queryStr = `SELECT id FROM users WHERE id=$1;
  `;
  let user_id = req.params.user_id;
  console.log("Start of GET/login", user_id);

  db.query(queryStr, [req.params.user_id])
    .then(user => {
      //create null user if user does not exist yet
      if(user.rows[0] === undefined) {
        const insertStr = `INSERT INTO users (full_name, email, created_at, password)
        VALUES (NULL, NULL, $1, NULL)
        RETURNING *;
        `;
        const created_at = new Date(Date.now());
        user_id = undefined;
        // console.log("1st .then of login", user.rows[0]);
        return db.query(insertStr, [created_at.toUTCString()]);
      }
    })
    .then(user => {
      if (user_id === undefined) {
        // console.log("2nd .then", user.rows[0]["id"]);
        user_id = user.rows[0]["id"];
      }
      // console.log("After 2nd .then", user_id);
      res.cookie("user_id", user_id);
      res.redirect(302, '/');
    })
    .catch(e => {
      console.error(e);
      res.send(e);
    });
});

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(302, '/');
});

app.get("/:user_id", (req, res) => {
  res.render("index");
});

// app.get("/:user_id", (req, res) => {
//   res.render("index");
// });

app.get("/:user_id/:list", (req, res) => {
  res.render("index");
});

/* start of POST queries */
/* POST query for user to register */
// add new tasks to a user's list(s)
app.post("/:user_id/add-task", (req, res) => {

  // const user_id = req.session.userId;
  const user_id = 2;
  const category = 'eat';
  const created_at = new Date(Date.now());

  let queryStr = `INSERT INTO tasks (user_id, last_modified, description, category)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `;

  db.query(queryStr, [user_id, created_at.toUTCString(), req.body["task"], category])
    // .then(task => console.log("Output from SQL:", task.rows)).
    .then(task => {
      console.log("1st .then of insert", task.rows);
      return db.query(`SELECT * FROM tasks WHERE user_id = $1;`, [user_id]);
    })
    .then(tasks => console.log("2nd .then of insert", tasks.rows))
    .catch(e => {
      console.error(e);
      res.send(e);
    })
});

/* Start of PUT queries */
app.put(":user_id/:task/:category", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/');
  }

  console.log("PUT a task into different category");

  let queryStr = `UPDATE tasks SET category = $1 WHERE user_id=$2 AND category=$3 RETURNING *;
  `;
  db.query(queryStr, [req.body["new-category"],req.cookies["user_id"], req.params.category])
    .then(result => {
      if(result.rows[0] === undefined) {
        // delete not successful
      }
    })
    .catch(e => res.send(e));
});

app.put(":user_id/:task/", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/');
  }
  console.log("Delete task");
  let queryStr = `UPDATE tasks SET description = $1 WHERE user_id=$2 AND id=$3 RETURNING *;
  `;
  db.query(queryStr, [req.body["new-description"], req.cookies["user_id"], req.params.task])
    .then(result => {
      if(result.rows[0] === undefined) {
        // delete not successful
      }
    })
    .catch(e => res.send(e));
});

app.put(":user_id/", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/');
  }

  console.log("Delete user");
  const password = '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.';
  let queryStr = `UPDATE tasks SET full_name = $1, email = $2, password = $3 WHERE user_id=$4 RETURNING *;
  `;
  db.query(queryStr, [req.body["new-name"], req.body["new-email"], password, req.cookies["user_id"]])
    .then(result => {
      if(result.rows[0] === undefined) {
        // delete not successful
      }
    })
    .catch(e => res.send(e));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
