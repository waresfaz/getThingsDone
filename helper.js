// checks if email is already in use
const getUserByEmail = (emailToCheck, users) => {
  for (let user_id in users) {
    if (users[user_id].email === emailToCheck) {
      return user_id;
    }
  }
};

// returns tasks 
const tasksForUser = (id, tasksDatabase) => {
  let filteredDatabase = {};
  for (let key in tasksDatabase) {
    if (tasksDatabase[key].userID === id) {
      filteredDatabase[key] = tasksDatabase[key];
    }
  }
  return filteredDatabase;
}

module.exports = { getUserByEmail, tasksForUser };