var fs = require('fs');
var bodyParser = require('body-parser');
var tmp = require('tmp');
tmp.setGracefulCleanup();

// Load config
var config = require('./config.json');

// Load custom crypto functions
var my_crypto = require('./my_crypto.js');

// Load KeePassIO functions
var kp = require('./kp_functions.js');

// Load express
var express = require('express');
var session = require('cookie-session');

var app = express();

/*            
 *            Define middleware
 */


var checkLoginKey = function (req, res, next) {
  if (req.session.login === true) {
    next();
  } else {
    res.send("Error: invalid session");
  }
};

/*
 *          Setup middleware
 */

app.use('/session', session({
  keys: config.sessionKeys, 
  secure: true,
  secureProxy: true,
  httpOnly: true,
  maxage: 300000
}));
app.use('/session/secure', checkLoginKey);
app.use(bodyParser()); // support for URL-encoded bodies in posts


/* 
 *            Application Logic
 *
 */

var pjson = require('./package.json');
var accounts;
var clear_key = false;
var login_attempts = 0;
var login_pause = false;
var lockout = false;
var logfile = './log.txt';
var lockfile = './lockfile';
var prefix = config.key_prefix;
var server;

/* 
 * Writes data to a tmp file
 * Currently, tmp file does not seem to be cleaned up properly automagically
 * I manually delete the tmp file later
 * This is used to pass the KDBX key to keepassio, since it only accepts
 * it as a file
 */

var write_tmp_file = function (data, next) {
  tmp.file(function _tempFileCreated(err, path, fd) {
    if (err) throw err;

    console.log("File: ", path);
    console.log("File descriptor: ", fd);

    fs.writeFileSync(path, data, 'utf8');
    next(path);
  });
};

/*
 * Generates the list of KeePass accounts
 */

var list_accts = function(req, key, keyfile, next) {
  
  var make_html = function(err, accts) {
    var html = "";
    if (err) {
      bad_login();
      html="Incorrect Password<br>Wait 2 seconds before retrying";
      log("KDBX unlock failed");
    }
    else {
      accts.forEach(function(entry) {
        html += "<p class='acct'>" + entry.title + "</p>";
      });
      log('***KDBX unlock success***');
    }
    fs.unlink(keyfile, function (err) {
      if (err) {
        throw err;
      }
      console.log("Deleted: " + keyfile);
    });
    accounts = accts;

    // Purge all account data from memory in 5 minutes
    setTimeout(function() {
      accounts = null;
    }, 300002);

    next(html);
  };

  kp.get_accts('./keepass/test.kdbx', key, keyfile, make_html);

};

var bad_login = function() {
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
    log('Server locked');
  }
};

var log = function() {
  var logstring = new Date();
  for (var i in arguments) {
    logstring += '\n' + arguments[i];
  }
  logstring += '\n\n';
  fs.appendFile(logfile, logstring, function (err) {
    if (err)
    throw err;
  });
};

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
app.post('/session/secure/show', function(req, res) {

  // Index from html account list
  var index= req.body.index;

  var notes = accounts[index].notes.split('\n').join('<br>');

  var html = "<tr><td>Username:</td><td>" + accounts[index].username + "</td></tr>";
  html += "<tr><td>Password:</td><td>" + accounts[index].password +"</td></tr>";
  html += "<tr><td>Notes:</td><td>" + notes + "</td></tr>";

  // Delete all session data
  accounts = null;
  req.session = null;

  // Send the account information
  res.send(html);
});

// Show account list
app.post('/session/secure/list', function(req, res) {
  var kdbx_pass = req.body.pass;

  var render = function(html) {
    res.send(html);
  };

  write_tmp_file(clear_key, function next(path) {
    list_accts(req, kdbx_pass, path, render);
  });

});

/*
 * Check if the supplied key properly decrypts the KDBX keyfile
 */

app.post('/session/auth', function(req, res) {
  var key = req.body.key;

  var logreq = req.ip + ': Decryption request';
  var logdata = 'Supplied key: ' + key;

  var cryptfile = "";

  // Try to decrypt each of the 5 key files
  for (var i = 0; i<5; i++) {
    cryptfile = prefix + 'key' + i + ".crypt";

    // false if decyption fails
    var test_key = my_crypto.decrypt_phrase(key, cryptfile);
    if (test_key) {
      clear_key = test_key;
      console.log(clear_key);
      break;
    }
    else {
      // Must set this explicitly to avoid memory
      clear_key = false;
    }
  }

  // Was the key properly decrypted?
  if (clear_key) {
    logdata += '\n***Decryption success***';
    log(logreq, logdata);

    if (config.delete_key_files === true) {
      fs.unlink(cryptfile, function (err) {
        if (err) {
          throw err;
        }
        console.log("Deleted: " + cryptfile);
      });
    }
    req.session.login = true;
    console.log(req.session.login_key);
    res.send("true");
  }
  else {
    logdata += '\nDecryption failed';
    log(logreq, logdata);
    bad_login();
    res.send("false");
  }
 
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
    app.enable('trust proxy');

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
