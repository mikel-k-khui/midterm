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
const database = require('./lib/db_all_queries');

// Postgres SQL files

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
// const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// app.use("/api/users", usersRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above


/* Start of GET queries */
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    database.getUserWithId(userID)
      .then(user => {
        const categories = ['eat', 'buy', 'read', 'watch'];

        let eatArr = [];
        let buyArr = [];
        let readArr = [];
        let watchArr = [];

        let eat = database.getActiveTasksByCategory(user.id, categories[0]).then(tasks => eatArr = tasks);
        let buy = database.getActiveTasksByCategory(user.id, categories[1]).then(tasks => buyArr = tasks);
        let read = database.getActiveTasksByCategory(user.id, categories[2]).then(tasks => readArr = tasks);
        let watch = database.getActiveTasksByCategory(user.id, categories[3]).then(tasks => watchArr = tasks);

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
    database.convertGuestIntoUser(user, userID)
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
    database.addUser(user, 0)
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
  database.login(email, password)
    .then(user => {
      if (!user) {
        res.send('Error: invalid password');
        return;
      }
      req.session.userID = user.id;
      res.redirect('/');
    })
    .catch(e => res.send('Error: invalid login.'));
});


app.get("/logout", (req, res) => {
  console.log("Logout");
  req.session = null;
  res.redirect('/');
});


/* start of POST/DELETE queries */
// Archive task
app.post("/:user_id/:task_id/archive", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/');
  }
  database.getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        database.updateFieldOfTask(userID, req.params.task_id, 'active', false)
          .then(() => {
            res.redirect('/');
          });
      }
    });
});

app.delete("/:user_id/:task_id/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/');
  }
  database.getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        database.deleteTask(userID, req.params.task_id)
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
  database.getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        database.updateFieldOfTask(userID, req.params.task_id, 'category', req.params.category)
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
  database.getUserWithId(userID)
    .then(user => {
      if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        res.send('Error: you do not have permission to do this operation.');
      } else {
        database.updateFieldOfTask(userID, req.params.task_id, 'description', newDescription)
          .then(() => {
            res.redirect('/');
          });
      }
    });
});

/* Start of PUT queries */
/* PUT query add new tasks to a user's list(s) */
app.put("/user_id/add-task", (req, res) => {
  let userID = req.session.userID;
  // console.log("Start of GET/login", req.session.userID);

  const categories = ['eat', 'buy', 'read', 'watch'];
  const categoryInfo = {
    eat: { title: 'To Eat'},
    buy: { title: 'To Buy'},
    read: { title: 'To Read'},
    watch: { title: 'To Watch'}
  };

  const category = categories[Math.floor(Math.random() * categories.length)]; // choose a random category
  let mostRecentTaskID, task;

  database.getUserWithId(userID)
    .then(user => {
      //Check if user exists in database before adding
      if (!user) {
        console.log(user);
        return database.addUser({}, 1);
      } else if (Number(user.id) !== Number(req.params.user_id)) { //check if cookies matches supplied URL
        // res.send('Error: you do not have permission to do this operation.');
      }
      return user;
    })
    .then(user => {
      task = req.body["task"];
      return database.addTask(user.id, task, category);
    })
    .then(latesttask => {
      userID = latesttask.user_id;
      req.session.userID = userID;
      mostRecentTaskID = latesttask.id;
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

      return res.json(
        {
          task: latesttask.description,
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
