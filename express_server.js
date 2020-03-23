const express = require("express");
const app = express()
const cookieSession = require("cookie-session");
const { getUserByEmail, tasksForUser } = require("./helper");
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

app.set('view engine', 'ejs')

function generateRandomString() {
  let result = '';
  let chars = '1234567890abcdefghijklmnopqrstuvwxyz'
  
  for (let i = 0; i <= 5; i++) {
    let gen = Math.floor(Math.random() * (36 - 0) + 0);
    result += chars[gen]
  }
return result;
}

const tasksDatabase = {
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    } else {
      res.redirect("/tasks");
    }
});

app.get("/tasks.json", (req, res) => {
  res.send(tasksDatabase);
});

app.get("/tasks", (req, res) => {
  let filteredData = tasksForUser(req.session.user_id, tasksDatabase); // user-specific tasks
  if (!req.session.user_id) {
    res.status(403).send("Login or register");
  } else {
    let templateVars = {
      filteredDatabase: filteredData,
      user: users[req.session.user_id]
    };
    res.render("tasks_index", templateVars);
  }
});

app.post("/tasks", (req, res) => {
  let taskID = generateRandomString();
  tasksDatabase[taskID] = {
    taskDescription: req.body.taskDescription,
    userID: req.session.user_id
  };
  res.redirect("/tasks");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user_id = getUserByEmail(email, users);

  //user doesn't exist
  if (!user_id) {
    res.status(403).send("User not found");
    return;
  }
  // password not found
  else if (!bcrypt.compareSync(password, users[user_id].password)) {
    res.status(403).send("Password incorrect");
  // email or pw match
  } else {
    req.session.user_id = user_id;
    res.redirect("/tasks");
    return;
  }
});

app.get("/tasks/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };

  if (!users[req.session.user_id]) {
    res.redirect("/login");
    return;
  }
  res.render("tasks_new", templateVars);
});

app.post("/tasks/:taskID/delete", (req, res) => {
  let userTasks = tasksForUser(req.session.user_id, tasksDatabase);

  for (let key in userTasks) {
    if (req.params.taskID === key) {
      delete tasksDatabase[req.params.taskID];
      res.redirect("/tasks");
      return;
    }
  }
  res.status(403).send("You cannot delete a task that is not yours");
  return;
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username)
  res.redirect("/tasks")
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if(!req.session.user_id) {
  res.render("register", templateVars);
  } else {
    res.redirect("/tasks");
  }
});

app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    res.status(400).send("Not accepted");
    return;
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Please select another email");
    return;
  }
  users[user_id] = { id: user_id, email: email, password: hashedPassword };

  req.session.user_id = user_id;
  res.redirect("/tasks");
});


app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if(!req.session.user_id) {
  res.render("login", templateVars);
} else {
  res.redirect("/tasks");
}
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/tasks");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
