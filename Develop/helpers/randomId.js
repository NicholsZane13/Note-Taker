var uniqid = require('uniqid');

//Function that returns a random ID each time a new note is created
randomId = () => {
  return uniqid();
};