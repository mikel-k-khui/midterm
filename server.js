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
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  let user;
  const queryString = 'SELECT * from users where id = $1';
  const values = id;
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
const login = function(email, password) {
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
 * @param {{full_name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const createdAt = new Date(Date.now());
  const queryString = 'INSERT INTO users (full_name, email, created_at, password) VALUES ($1, $2, $3, $4) RETURNING *;';
  return db.query(queryString, [user.fullname, user.email, createdAt.toUTCString(), user.password])
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};

/**
 * Add a guest user to the database (cookie already assigned)
 * @param {{full_name: string, password: string, email: string}} user
 * @param {guestUserID} The user ID to update
 * @return {Promise<{}>} A promise to the user.
 */
const convertGuestIntoUser = function(user, guestUserID) {
  const createdAt = new Date(Date.now());
  const queryString = 'UPDATE users SET full_name = $1, email = $2, created_at = $3, password = $4 WHERE id = $5 RETURNING *;';
  return db.query(queryString, [user.fullname, user.email, createdAt.toUTCString(), user.password, guestUserID])
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};

/**
 * Get active tasks for a corresponding user in a given category
 * @param {int} user ID
 * @param {string} category
 * @return {Promise<{}>} A promise to the user.
 */
const getActiveTasksByCategory = function(userid, category) {
  const queryString = 'SELECT tasks.id, tasks.description, tasks.category, to_char(tasks.last_modified, \'Mon DD, YYYY\') AS last_modified FROM tasks JOIN users on user_id = users.id WHERE users.id = $1 AND category = $2 AND active = true ORDER BY tasks.last_modified DESC;';
  return db.query(queryString, [userid, category])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};

/**
 * Update task category for a corresponding user
 * @param {int} userid
 * @param {int} taskid
 * @param {string} newcategory
 * @return {Promise<{}>} A promise to the user.
 */
const updateFieldOfTask = function(userid, taskid, fieldToUpdate, newValue) {
  let queryString;
  switch (fieldToUpdate) {
  case 'category':
    queryString = 'UPDATE tasks SET category = $1 WHERE id=$2 AND user_id=$3 RETURNING *;';
    break;
  case 'active':
    queryString = 'UPDATE tasks SET active = $1 WHERE id=$2 AND user_id=$3 RETURNING *;';
    break;
  case 'description':
    queryString = 'UPDATE tasks SET description = $1 WHERE id=$2 AND user_id=$3 RETURNING *;';
    break;
  default:
  }
  return db.query(queryString, [newValue, taskid, userid])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};







app.delete("/:user_id/:task_id/", (req, res) => {
  console.log("Delete task");
  if (!req.session.userID) {
    res.redirect('/');
  }
  let queryStr = 'DELETE FROM tasks WHERE user_id=$1 AND id=$2 RETURNING *;';
  db.query(queryStr, [req.session.userID, req.params.task_id])
    .then(result => {
      console.log("Deleted task", result.rows[0], "and cleared", req.params.task_id);
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
  if (userID) {
    getUserWithId(userID)
      .then(user => {
        const categories = ['eat', 'buy', 'read', 'watch'];

        let eatArr = [];
        let buyArr = [];
        let readArr = [];
        let watchArr = [];

        let eat = getActiveTasksByCategory(user.id, categories[0]).then(tasks => eatArr = tasks);
        let buy = getActiveTasksByCategory(user.id, categories[1]).then(tasks => buyArr = tasks);
        let read = getActiveTasksByCategory(user.id, categories[2]).then(tasks => readArr = tasks);
        let watch = getActiveTasksByCategory(user.id, categories[3]).then(tasks => watchArr = tasks);

        Promise.all([eat, buy, read, watch]).then(() => {
          const templateVars = {
            user: user,
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
  const user = req.body;
  if (userID) {
    // to save list started as a guest, assume we have an existing userID from a guest cookie, then we'll update the DB rather than insert a new entry
    //check for existing email address...
    user.password = bcrypt.hashSync(user.password, 12);
    convertGuestIntoUser(user, userID)
      .then(user => {
        if (!user) {
          res.send({error: "error"});
          return;
        }
        req.session.userID = user.id; // shouldn't really be necessary given that the cookie already existed...
        res.redirect('/');
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
    })
    .catch(e => res.send('Error: invalid email address.'));
});


app.get("/logout", (req, res) => {
  console.log("Logout");
  req.session = null;
  res.redirect('/');
});


/* start of POST queries */
// Archive task
app.post("/:user_id/:task_id/archive", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/');
  }
  getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        updateFieldOfTask(userID, req.params.task_id, 'active', false)
          .then(() => {
            res.redirect('/');
          });
      }
    });
});

// Change category of task
app.post("/:user_id/:task_id/:category", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/');
  }
  getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        updateFieldOfTask(userID, req.params.task_id, 'category', req.params.category)
          .then(() => {
            res.redirect('/');
          });
      }
    });
});

//Change description of task: currently defaults to manual
app.post("/:user_id/:task_id", (req, res) => {
  const userID = req.session.userID;
  const newDescription = 'Snacks';
  if (!userID) {
    res.redirect('/');
  }
  getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        updateFieldOfTask(userID, req.params.task_id, 'description', newDescription)
          .then(() => {
            res.redirect('/');
          });
      }
    });
});

/* Start of PUT queries */
/* PUT query add new tasks to a user's list(s) */
app.put("/user_id/add-task", (req, res) => {
  const created_at = new Date(Date.now());
  const userID = req.session.userID;
  let queryStr = 'SELECT id FROM users WHERE id=$1;';
  console.log("Start of GET/login", req.session.userID);

  const categories = ['eat', 'buy', 'read', 'watch'];
  const categoryInfo = {
    eat: { title: 'To Eat'},
    buy: { title: 'To Buy'},
    read: { title: 'To Read'},
    watch: { title: 'To Watch'}
  };

  const category = categories[Math.floor(Math.random() * categories.length)]; // choose a random category
  let mostRecentTaskID, task;

  db.query(queryStr, [req.session.userID])
    .then(user => {
      //Check if user exists in database before adding
      if (user.rows[0] === undefined) {
        console.log("Before insert to user", user.rows[0]);
        const insertStr = 'INSERT INTO users (full_name, email, created_at, password) VALUES (NULL, NULL, $1, NULL) RETURNING *;';
        return db.query(insertStr,[created_at.toUTCString()]);
      } else {
        return user;
      }
    })
    .then(user => {
      // console.log('category', category, 'task', task);
      task = req.body["task"];
      const insertStr = 'INSERT INTO tasks (user_id, last_modified, description, category) VALUES ($1, $2, $3, $4) RETURNING *;';
      console.log("Before add SQL:", user.rows[0]["id"], created_at.toUTCString(), task, category);
      return db.query(insertStr, [user.rows[0]["id"], created_at.toUTCString(), task, category]);
    })
    .then(task => {
      req.session.userID = task.rows[0]["user_id"];
      console.log("1st .then of insert = added task okay", task.rows[0]["user_id"], "vs userID:", req.session.userID);
      mostRecentTaskID = task.rows.slice(-1)[0].id; // get latest task ID
      return db.query('SELECT * FROM tasks WHERE user_id = $1;', [task.rows[0]["user_id"]]);
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
  console.log(`Listify listening on port ${PORT}`);
});
