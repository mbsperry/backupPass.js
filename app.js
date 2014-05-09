var fs = require('fs');
var bodyParser = require('body-parser');
var tmp = require('tmp');
tmp.setGracefulCleanup();

// Load config
var config = require('./config.json');

// Load custom crypto functions
var my_crypto = require('./my_crypto.js');

// Load logger
var logger = require('./log.js');

// Load KeePassIO functions
var kp = require('./kp_functions.js');

// Load application routes
var auth = require('./auth.js');
var post = require('./post.js');

// Load express
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var memStore = new session.MemoryStore();

var app = express();

/*            
 *            Define middleware
 */


var checkLoginKey = function (req, res, next) {
  if (req.session.login === true) {
    next();
  } else {
    console.log("Invalid login session");
    res.send("Error: invalid session");
  }
};

var checkHTTPS = function (req, res, next) {
};


/*
 *          Setup middleware
 */

app.enable('trust proxy');
app.use(bodyParser.urlencoded()); // support for URL-encoded bodies in posts
app.use(cookieParser());
app.use('/session', session({
  secret: "test",
  key: 'sid',
  store: memStore,
  cookie: {
    keys: config.sessionKeys, 
    SecureProxy: true,
    httpOnly: true,
    maxage: 300000
  }
}));
app.use('/session/secure', checkLoginKey);

/* 
 *            Application Logic
 *
 */

var pjson = require('./package.json');
var login_attempts = 0;
var login_pause = false;
var lockout = false;
var lockfile = './lockfile';
var server;


/*
 *
 *        Routing
 *
 */

// If we're in production mode, only accept https requests
// x-forwarded-proto is a heroku specific header
app.all('*', function(req, res, next) {
  if (lockout === false && login_pause === false) {
    if (process.env.NODE_ENV == "production") {
      if (req.headers['x-forwarded-proto']=='https') {
        next();
      } else {
        if (config.redirect === true) {
          res.redirect('https://' + req.host);
        }
      }
    } else {
      next();
    }
  }
});

app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});

app.get('/version', function(req, res) {
  res.send(pjson.version);
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
app.post('/session/secure/show', post.show);

// Show account list
app.post('/session/secure/list', post.list);

// Check key
app.post('/session/auth', auth.check_key);

/*
 *      Error handling
 */

var bad_login = function() {
  console.log("A bad login attempt");
  login_attempts += 1;
  login_pause = true;

  setTimeout(function() {
    login_pause = false;
  }, 2000);

  if (login_attempts > 2) {
    lockout = true;
    server.close();
    fs.writeFile('./lockfile', 'Server locked', function write(err) {
      if (err) 
        throw err;
    });
    logger.log('Server locked');
  }
};

app.use(function(err, req, res, next) {
  console.log("Error handler received: " + err);
  console.log(err.stack);

  // Not sure if I want to do this -- 
  // maybe allow people another chance at entering password 
  // before destroying the session?
  req.session = null;

  res.status(401).send({ error: 'Error: Invalid credentials' } );
  bad_login();
});


/*
 *
 *        Start the server
 *
 */


try {
  fs.readFileSync('./lockfile');
    console.log("locked");
} catch (err) {
  // Only start the server if the file doesn't exist

  if (config.mode == "production")
  {
    // Trust heroku's forwarding -- note that this can be spoofed easily

    server = app.listen(process.env.PORT || 5000);
    console.log("Server started");
  }
  else
  {
    // This is for testing locally
    var https = require('https');
    var privateKey  = fs.readFileSync('sslcert/backup_pass-key.pem');
    var certificate = fs.readFileSync('sslcert/public-cert.pem');
    var credentials = {key: privateKey, cert: certificate};
    var httpsServer = https.createServer(credentials, app);
    server = httpsServer.listen(8443);
    console.log("Server started");
  }

}

module.exports = server;
