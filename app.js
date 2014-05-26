var fs = require('fs')
  , crypto = require('crypto')
  , bodyParser = require('body-parser')

// Secure HTTP headers
  , helmet = require('helmet')

// Load logger
  , logger = require('./lib/log')

// Load config options
  , config = require('./lib/config')

// Load application routes
  , auth = require('./routes/auth.js')
  , list = require('./routes/list.js')
  , show = require('./routes/show.js')

// Load session logic
  , Sessions = require('./lib/session')

// Load express
  , express = require('express')

  , app = express()

/*
 *          Setup middleware
 */

app.enable('trust proxy')
app.use(helmet.defaults())
app.use(bodyParser.json()) // support for URL-encoded bodies in posts

/* Check session keys for validity */
app.use('/secure/', function(req, res, next) {
  Sessions.validate(req.body.sessKey, function(err, sess) {
    if (err) {
      return next(err)
    } else if (sess) {
      req.session = sess
      return next()
    } else {
      next(new Error('INVALID_SESSION'))
    }
  })
})

/* 
 *            Application Logic
 *
 */

var version = require('./package.json').version
  , login_attempts = 0
  , login_pause = false
  , lockout = false
  , server


/*
 *
 *        Routing
 *
 */

// If we're in production mode, only accept https requests
// x-forwarded-proto is a heroku specific header
app.all('*', function(req, res, next) {
  if (lockout === false && login_pause === false) {
    if (config.mode == "production") {
      if (req.headers['x-forwarded-proto']=='https') {
        next()
      } else {
        if (config.redirect === true) {
          res.redirect('https://' + req.host)
        }
      }
    } else {
      next()
    }
  } else {
    res.status(404).send({ error: 'Not found' } )
  }
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
app.post('/secure/show', show)

// Show account list
app.post('/secure/list', list)

// Check key, return true and 32byte sessionKey if good
app.post('/auth', auth, function(req, res) {
  var sessKey = crypto.randomBytes(32).toString('hex')
  Sessions.createSession(sessKey, req.clearKey)
  res.send({ sessKey: sessKey, response: true })
})

/*
 *      Error handling
 */

function bad_login (next) {
  var pauseLength
    , deleteKeyFiles
    , deleteKDBX
    , key_prefix = config.key_prefix

  login_attempts += 1
  login_pause = true

  setTimeout(function() {
    login_pause = false
  }, pauseLength)

  // Lock server, delete all key files and database
  // after 3 failed attempts
  if (login_attempts > 2) {
    lockout = true
    //server.close()
    fs.writeFile('./lockfile', 'Server locked', function write(err) {
      if (err)
        return next(err)
    })
    logger(2, "Deleting all key files")

    deleteKeyFiles = function(err, files) {
      if (err) return next(err)
      files.forEach(function (file) {
        fs.unlink(key_prefix + file, function() { if (err) return next(err) })
      })
      deleteKDBX()
    }

    fs.readdir(key_prefix, deleteKeyFiles)

    deleteKDBX = function() {
      logger(2, "Deleting KDBX: " + config.keepass_path)
      fs.unlink(config.keepass_path, function(err) {
        if (err) return next(err)
      })
    }

    logger(2, 'Server locked')
  }
}

app.use(function (err, req, res, next) {
  logger(2, "Error handler received: " + err)
  if (err.message == 'BAD_LOGIN') {
    res.status(401).send({ error: 'Error: Invalid credentials' } )
    bad_login(next)
  } else if (err.message == 'INVALID_SESSION') {
    res.status(403).send({ error: 'Invalid session'})
  } else {
    next(err)
  }
})

app.use(function errorHandler (err, req, res, _) {
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


try {
  fs.readFileSync('./lockfile')
    logger(1, "locked")
} catch (err) {
  // Only start the server if the file doesn't exist

  if (config.mode == "production")
  {
    // Trust heroku's forwarding -- note that this can be spoofed easily

    server = app.listen(process.env.PORT || 5000)
    logger(1, "Server started")
  }
  else
  {
    server = app.listen(3000)
    logger(1, "Testing server started")
    logger(1, "*******************************************")
    logger(1, "********       TESTING ONLY        ********")
    logger(1, "******** THIS SERVER IS NOT SECURE ********")
    logger(1, "*******************************************")
  }

}

// Restart method for testing purposes
server.restart = function() {
  if (config.mode != 'production') {
    lockout = false
    server.listen(8443)
    logger(2, "Server restarted")
  }
}

module.exports = server
