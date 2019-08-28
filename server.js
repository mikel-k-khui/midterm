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
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
// const cookieParser = require('cookie-parser');
const bcrypt     = require('bcrypt');

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

//setup method override for RESTful
app.use(methodOverride('_method'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
const expiryDate = new Date(Date.now() + (7 * 24 * 60 * 60 * 100)); // seven day expiry if not deleted on the client side
app.use(cookieSession({
  name: 'listify',
  keys: ['12345'],
  // maxAge: 24 * 60 * 60 * 1000
  expires: expiryDate
}));
//setup the cookie for name, key and 24 hours maximum session stay if session is still open

// app.use(cookieParser());

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

/* Start of function declarations, abstract away later */

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  let user;
  const queryString = 'SELECT * from users where email = $1';
  const values = email;
  return db.query(queryString, [values])
    .then(res => {
      user = res.rows[0];
      if (user) {
        return user;
      }
      return null;
    })
    .catch(err => console.error('query error', err.stack));
};

/**
 * Check if a user exists with a given username and password
 * @param {String} email
 * @param {String} password encrypted
 */
const login =  function(email, password) {
  return getUserWithEmail(email)
    .then(user => {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      }
      return null;
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const createdAt = new Date(Date.now());
  const queryString = 'INSERT INTO users (full_name, email, created_at, password) VALUES ($1, $2, $3, $4) RETURNING *;';
  return db.query(queryString, [user.fullname, user.email, createdAt.toUTCString(), user.password])
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};

const convertGuestIntoUser =  function(user, guestUserID) {
  const createdAt = new Date(Date.now());
  const queryString = 'UPDATE users SET full_name = $1, email = $2, created_at = $3, password = $4) WHERE id = $5; RETURNING *;';
  return db.query(queryString, [user.fullname, user.email, createdAt.toUTCString(), user.password, guestUserID])
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};

/* Start of DELETE queries */
app.delete("/:user_id/:task_id/:category", (req, res) => {
  if (!req.session.userID) {
    res.redirect('/');
  }
  let queryStr = `DELETE FROM tasks WHERE user_id=$1 AND category=$2 RETURNING *;
  `;
  console.log("Deleted task in ", req.params.category, "for", req.session.userID);

  db.query(queryStr, [req.session.userID, req.params.category])
    .then(result => {
      if (result.rows[0] === undefined) {
        console.log("Deleted task in ", req.params.category, "\n", result.rows[0]);
        res.redirect('/');
      }
    })
    .catch(e => res.send(e));
});

app.delete("/:user_id/:task_id/", (req, res) => {
  console.log("Delete task");
  if (!req.session.userID) {
    res.redirect('/');
  }
  let queryStr = `DELETE FROM tasks WHERE user_id=$1 AND id=$2 RETURNING *;
  `;
  db.query(queryStr, [req.session.userID, req.params.task_id])
    .then(result => {
      console.log("Deleted task", result.rows[0], "and cleared", req.params.task_id);
      res.redirect('/');
    })
    .catch(e => res.send(e));
});

app.delete("/:user_id/", (req, res) => {
  if (!req.session.userID) {
    res.redirect('/');
  }
  let deleteStr = `DELETE FROM users WHERE id=$1 RETURNING *;
  `;
  db.query(deleteStr, [req.session.userID])
    .then(result => {
      console.log("Deleted user", result.rows[0], "and cleared", req.session.userID);
      req.session = null;
      res.redirect('/');
    })
    .catch(e => res.send(e));
});

/* Start of GET queries */
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  const userID = req.session.userID;
  console.log(userID);

  if (userID) {
    const userQueryString = `SELECT id, full_name FROM users WHERE id=$1;
    `;
    console.log("Route for GET/ w user=", req.session.userID);
    db.query(userQueryString, [req.session.userID])
      .then(user => {
        console.log("Index 1st .then", user.rows[0]);

        const categories = ['eat', 'buy', 'read', 'watch'];
        const categoryQueryString = 'SELECT tasks.id, tasks.description, tasks.category, to_char(tasks.last_modified, \'Mon DD, YYYY\') AS last_modified FROM tasks JOIN users on user_id = users.id WHERE users.id = $1 AND category = $2 AND active = true ORDER BY tasks.last_modified DESC;';
        let eatArr = [];
        let buyArr = [];
        let readArr = [];
        let watchArr = [];
        const eat = db.query(categoryQueryString, [userID, categories[0]])
          .then(res => eatArr = res.rows);
        const buy = db.query(categoryQueryString, [userID, categories[1]])
          .then(res => buyArr = res.rows);
        const read = db.query(categoryQueryString, [userID, categories[2]])
          .then(res => readArr = res.rows);
        const watch = db.query(categoryQueryString, [userID, categories[3]])
          .then(res => watchArr = res.rows);

        Promise.all([eat, buy, read, watch]).then(() => {
          const templateVars = {
            user: user.rows[0],
            eats: eatArr,
            buys: buyArr,
            reads: readArr,
            watches: watchArr
          };
          res.render('index', templateVars);
        }).catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
      })
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  } else {
    console.log("Route for GET/ w no user=", userID);
    res.render("index", {user: undefined});
  }
});

// Create a new user, starting from a guest if cookie already exists
app.post('/register', (req, res) => {
  const userID = req.session.userID;
  console.log('userID on POST /register', userID);
  const user = req.body;
  console.log('user here', user);
  if (userID) {
    // to save list started as a guest, assume we have an existing userID from a guest cookie, then we'll update the DB rather than insert a new entry
    getUserWithEmail(user.email)
      .then(user => {
      //check for existing email address...
        if (user) {
          res.send('Error: email has already been registered!');
          return;
        }
        user.password = bcrypt.hashSync(user.password, 12);
        convertGuestIntoUser(user, userID)
          .then(user => {
            if (!user) {
              res.send('Error: invalid username.');
              return;
            }
            req.session.userID = user.id;
            console.log('my id is', user.id);
            res.redirect('/');
          });
      })
      .catch(e => res.send(e));
  } else {
    // add a vanilla user
    //check for existing email address...
    user.password = bcrypt.hashSync(user.password, 12);
    addUser(user)
      .then(user => {
        if (!user) {
          res.send({error: "error"});
          return;
        }
        req.session.userID = user.id;
        res.redirect('/');
      })
      .catch(e => res.send(e));
  }
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  login(email, password)
    .then(user => {
      if (!user) {
        res.send('Error: invalid password');
        return;
      }
      req.session.userID = user.id;
      res.redirect('/');
      // res.send({user: {name: user.full_name, email: user.email, id: user.id}});
    })
    .catch(e => res.send('Error: invalid email address.'));
});

app.get("/login/:user_id", (req, res) => {
  let queryStr = `SELECT id FROM users WHERE id=$1;
  `;
  console.log("Start of GET/login any", req.session.userID);

  db.query(queryStr, [req.params.user_id])
    .then(user => {
      if (user.rows[0] === undefined) {
        res.redirect('/', {user: undefined});
      }
      req.session.userID = user.rows[0]["id"];
      console.log("Logged in for", req.session.userID);
      res.redirect('/');
    })
    .catch(e => {
      console.error(e);
      res.send(e);
    });
});

app.get("/logout", (req, res) => {
  console.log("Logout");
  req.session = null;
  res.redirect('/');
});

// app.get("/:user_id", (req, res) => {
//   if (req.session.userID) {
//     let queryStr = `SELECT id, full_name FROM users WHERE id=$1;
//     `;
//     console.log("Route for GET/:user_id w user=", req.session.userID);
//     db.query(queryStr, [req.session.userID])
//       .then(user => {
//         console.log("Index 1st .then", user.rows[0]);
//         res.render("index", {user: user.rows[0]});
//       })
//       .catch(e => {
//         console.error(e);
//         res.send(e);
//       });
//   } else {
//     console.log("Route for GET/:user_id w no user=", req.session.userID);
//     res.render("index", {user: undefined});
//   }
// });

// app.get("/:user_id", (req, res) => {
//   res.render("index");
// });

app.get("/:user_id/:list", (req, res) => {
  if (req.session.userID) {
    let queryStr = `SELECT id, full_name FROM users WHERE id=$1;
    `;
    console.log("Route for GET/:user_id/:list w user=", req.session.userID);
    db.query(queryStr, [req.session.userID])
      .then(user => {
        console.log("Index 1st .then", user.rows[0]);
        res.render("index", {user: user.rows[0]});
      })
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  } else {
    console.log("Route for GET/:user_id/:list w no user=", req.session.userID);
    res.render("index", {user: undefined});
  }
});

/* start of POST queries */
// Change category of task
app.post("/:user_id/:task_id/archive", (req, res) => {
  if (!req.session.userID) {
    res.redirect('/');
  }

  let queryStr = `UPDATE tasks SET active = $1 WHERE id=$2 AND user_id=$3 RETURNING *;
  `;
  console.log('false', req.params.task_d, req.session.userID);
  db.query(queryStr, ['false', req.params.task_id, req.session.userID])
    .then(result => {
      console.log("Archived task", result.rows[0], "and updated", req.params.task_id, "to", result.rows[0]["category"]);
      res.redirect('/');
    });
  // .catch(e => res.send(e));
});

// Change category of task
app.post("/:user_id/:task_id/:category", (req, res) => {
  if (!req.session.userID) {
    res.redirect('/');
  }

  let queryStr = `UPDATE tasks SET category = $1 WHERE id=$2 AND user_id=$3 RETURNING *;
  `;
  console.log(req.params.category, req.params.task_d, req.session.userID);
  db.query(queryStr, [req.params.category, req.params.task_id, req.session.userID])
    .then(result => {
      console.log("Edited task's category", result.rows[0], "and updated", req.params.task_id, "to", result.rows[0]["category"]);
      res.redirect('/');
    });
  // .catch(e => res.send(e));
});

//Change description of task: current default to manual
app.post("/:user_id/:task_id", (req, res) => {
  if (!req.session.userID) {
    res.redirect('/');
  }
  console.log("Edit task");
  const new_description = 'my shborts';
  let queryStr = `UPDATE tasks SET description = $1 WHERE user_id=$2 AND id=$3 RETURNING *;
  `;
  db.query(queryStr, [new_description, req.session.userID, req.params.task_id])
    .then(result => {
      console.log("Edited task", result.rows[0], "and updated", req.params.task_id, "to", result.rows[0]["description"]);
      res.redirect('/');
    })
    .catch(e => res.send(e));
});

//Change user name, email and password
// app.post("/:user_id", (req, res) => {
//   console.log("Edit user", req.session.userID);

//   if (!req.session.userID) {
//     console.log("No user?", req.session.userID);
//     res.redirect('/');
//   }

//   const password = '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.';
//   const new_name = 'Nathasa Romanova';
//   const new_email = 'black.widow@avengers.org';
//   let queryStr = `UPDATE users SET full_name = $1, email = $2, password = $3 WHERE id=$4 RETURNING *;
//   `;
//   // db.query(queryStr, [req.body["new_name"], req.body["new_email"], password, req.session.userID])
//   db.query(queryStr, [new_name, new_email, password, req.session.userID])
//     .then(result => {
//       res.redirect('/');
//     })
//     .catch(e => res.send(e));
// });

/* Start of PUT queries */
/* PUT query add new tasks to a user's list(s) */
app.put("/user_id/add-task", (req, res) => {
  const created_at = new Date(Date.now());
  let queryStr = `SELECT id FROM users WHERE id=$1;
  `;
  console.log("Start of GET/login", req.session.userID);

  const categories = ['eat', 'buy', 'read', 'watch'];
  const categoryInfo = {
    eat: { title: 'To Eat', buttonCode: ''},
    buy: { title: 'To Buy', buttonCode: '<button class="btn btn-lg">To Buy <i class="fas fa-shopping-cart"></i></button>'},
    read: { title: 'To Read', buttonCode: '<button class="btn btn-lg">To Read <i class="fas fa-book"></i></button>'},
    watch: { title: 'To Watch', buttonCode: '<button class="btn btn-lg">To Watch <i class="fas fa-video"></i></button>'}
  };

  const category = categories[Math.floor(Math.random() * categories.length)]; // choose a random category
  let mostRecentTaskID, task;

  db.query(queryStr, [req.session.userID])
    .then(user => {
      //Check if user exists in database before adding
      if (user.rows[0] === undefined) {
        console.log("Before insert to user", user.rows[0]);
        const insertStr = `INSERT INTO users (full_name, email, created_at, password)
          VALUES (NULL, NULL, $1, NULL)
          RETURNING *;
          `;
        return db.query(insertStr,[created_at.toUTCString()]);
      } else {
        return user;
      }
    })
    .then(user => {
      // console.log('category', category, 'task', task);
      task = req.body["task"];
      const insertStr = `INSERT INTO tasks (user_id, last_modified, description, category)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
      console.log("Before add SQL:", user.rows[0]["id"], created_at.toUTCString(), task, category);
      return db.query(insertStr, [user.rows[0]["id"], created_at.toUTCString(), task, category]);
    })
    .then(task => {
      req.session.userID = task.rows[0]["user_id"];
      console.log("1st .then of insert = added task okay", task.rows[0]["user_id"], "vs userID:", req.session.userID);
      mostRecentTaskID = task.rows.slice(-1)[0].id; // get latest task ID
      return db.query(`SELECT * FROM tasks WHERE user_id = $1;`, [task.rows[0]["user_id"]]);
    })
    .then(tasks => {
      console.log("2nd .then of insert to return list of items", tasks.rows);
      // res.redirect("/");
      const userID = tasks.rows.slice(-1)[0].user_id;
      const buttonsHTML = {
        eat: '<button type="submit" class="btn btn-lg" formaction="/' + userID + '/' + mostRecentTaskID + '/eat">To Eat <i class="fas fa-utensils"></i></button>',
        buy: '<button type="submit" class="btn btn-lg" formaction="/' + userID + '/' + mostRecentTaskID + '/buy">To Buy <i class="fas fa-shopping-cart"></i></button>',
        read: '<button type="submit" class="btn btn-lg" formaction="/' + userID + '/' + mostRecentTaskID + '/read">To Read <i class="fas fa-book"></i></button>',
        watch: '<button type="submit" class="btn btn-lg" formaction="/' + userID + '/' + mostRecentTaskID + '/watch">To Watch <i class="fas fa-video"></i></button>'
      };

      let buttons = [];
      for (let i = 0; i < categories.length; i++) {
        if (categories[i] !== category) {
          buttons.push(categories[i]);
        }
      } // get three 'remaining' categories

      res.json(
        {
          task: task,
          userID: userID,
          taskID: mostRecentTaskID,
          category: categoryInfo[category]["title"],
          button1: buttonsHTML[buttons[0]],
          button2: buttonsHTML[buttons[1]],
          button3: buttonsHTML[buttons[2]]
        }); // send json response for AJAX request

    })
    .catch(e => {
      console.warn("Unsuccessful add task");
      console.error(e);
      res.send(e);
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
