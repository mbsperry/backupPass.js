var fs = require('fs');
var bodyParser = require('body-parser');
var helmet = require('helmet');

// Load logger
var logger = require('./lib/log');

// Load config options
var config = require('./lib/config');

// Load express
var express = require('express');

var app = express();


/*
 *          Setup middleware
 */

app.use(helmet.defaults());
app.use(bodyParser.json()); // support for json-encoded bodies in posts


/* 
 *            Application Logic
 *
 */

var version = require('./package.json').version;
var server;


/*
 *
 *        Routing
 *
 */

app.get('/error', function(req, res, next) {
  return next(new Error("Unhandled error"));
});

app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});

app.get('/version', function(req, res) {
  res.send(version);
});

app.get('/style.css', function(req, res) {
  res.sendfile('./public/style.css');
});

app.get('/index.js', function(req, res) {
  res.sendfile('./public/index.js');
});

app.get('/jquery-1.11.0.min.js', function(req, res) {
  res.sendfile('./public/jquery-1.11.0.min.js');
});

// Show account information
app.post('/session/secure/show', function(req, res) {
  var result = {
    username: "Testing only",
    password: "Ultrasecret",
    notes: "Some Additional information\nWould go here"
  };
  res.send(result);
});

// Show account list
app.post('/session/secure/list', function(req, res) {
  var testAccounts = ["Google", "Apple", "Microsoft", "Github", "Work", "Email", "School", "Test1", "Test2", "Test3", "Test4", "Test5", "Test6", "Test7", "Test8"];
  res.json(testAccounts);
});

// Check key
app.post('/session/auth', function(req, res) {
  res.send({ response: true});
});

/*
 *      Error handling
 */

app.use(function (err, req, res, next) {
  logger(2, "Error handler received: " + err);
  if (err.message == 'BAD_LOGIN') {
    // Not sure if I want to do this -- 
    // maybe allow people another chance at entering password 
    // before destroying the session?
    req.session = null;
    res.status(401).send({ error: 'Error: Invalid credentials' } );
  } else if (err.message == 'invalid csrf token') {
    res.status(403).send({ error: 'Invalid session'});
  } else {
    next(err);
  }
});

app.use(function errorHandler (err, req, res, next) {
  logger(1, "Unhandled error, shutting down");
  logger(1, err.stack);
  res.status(500).send("Internal server error");
  process.exit();
});


/*
 *
 *        Start the server
 *
 */



server = app.listen(3000);
logger(1, "Front End Testing server started");

module.exports = server;
