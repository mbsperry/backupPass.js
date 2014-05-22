/* This is a mockup server for testing the front end UX
 * It only serves a fake account list and account
 * It does no actual authentication
 */

var fs = require('fs')
  , bodyParser = require('body-parser')
  , helmet = require('helmet')

// Load logger
  , logger = require('./lib/log')

// Load config options
  , config = require('./lib/config')

// Load express
  , express = require('express')

  , app = express()

  , version = require('./package.json').version
  , server

/*
 *          Setup middleware
 */

app.use(helmet.defaults())
app.use(bodyParser.json()) // support for json-encoded bodies in posts


/* 
 *            Application Logic
 *
 */



/*
 *
 *        Routing
 *
 */

app.get('/error', function(req, res, next) {
  return next(new Error("Unhandled error"))
})

app.get('/', function (req, res) {
  res.sendfile('./public/index.html')
})

app.get('/legacy', function(req, res) {
  res.sendfile('./public/legacy.html')
})

app.get('/version', function(req, res) {
  res.send(version)
})

app.get('/style.css', function(req, res) {
  res.sendfile('./public/style.css')
})

app.get('/legacy.css', function(req, res) {
  res.sendfile('./public/legacy.css')
})

app.get('/index.js', function(req, res) {
  res.sendfile('./public/index.js')
})

app.get('/legacy.js', function(req, res) {
  res.sendfile('./public/legacy.js')
})

app.get('/json2.js', function(req, res) {
  res.sendfile('./public/json2.js')
})

app.get('/jquery-1.11.0.min.js', function(req, res) {
  res.sendfile('./public/jquery-1.11.0.min.js')
})

// Show account information
app.post('/session/secure/show', function(req, res) {
  var result = {
    username: "Testing only",
    password: "Ultrasecret",
    notes: "Some Additional information\nWould go here"
  }
  res.send(result)
})

// Show account list
app.post('/session/secure/list', function(req, res) {
  var testAccounts = ["Google", "Apple", "Microsoft", "Github", "Work", "Email", "School", "Test1", "Test2", "Test3", "Test4", "Test5", "Test6", "Test7", "Test8"]
  res.json(testAccounts)
})

// Check key
app.post('/session/auth', function(req, res, next) {
  if (req.body.key == "error") { 
    next(new Error("BAD_LOGIN"))
  }
  res.send({ response: true})
})

/*
 *      Error handling
 */

app.use(function (err, req, res, next) {
  logger(2, "Error handler received: " + err)
  if (err.message == 'BAD_LOGIN') {
    // Not sure if I want to do this -- 
    // maybe allow people another chance at entering password 
    // before destroying the session?
    req.session = null
    res.status(401).send({ error: 'Error: Invalid credentials' } )
  } else if (err.message == 'invalid csrf token') {
    res.status(403).send({ error: 'Invalid session'})
  } else {
    next(err)
  }
})

app.use(function errorHandler (err, req, res, next) {
  logger(1, "Unhandled error, shutting down")
  logger(1, err.stack)
  res.status(500).send("Internal server error")
  process.exit()
})


/*
 *
 *        Start the server
 *
 */



server = app.listen(3000)
logger(1, "Front End Testing server started")
logger(1, "This is a mockup server with no functionality")

module.exports = server
