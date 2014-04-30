var fs = require('fs');
var bodyParser = require('body-parser');
var tmp = require('tmp');
tmp.setGracefulCleanup();

// Load custom crypto functions
var my_crypto = require('./my_crypto.js');

// Load KeePassIO functions
var kp = require('./kp_functions.js');

// Load sequential execution functions
var series = require('./sequential.js');


// Load express
var express = require('express');
var app = express();
app.use(bodyParser()); // support for URL-encoded bodies in posts


/* 
 *            Application Logic
 *
 */

var passwords = [];
var clear_key = false;
var login_attempts = 0;
var login_pause = false;
var lockout = false;
var logfile = './log.txt';

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

var list_accts = function(key, keyfile, next) {
  kp.get_accts('./keepass/test.kdbx', key, keyfile, function(error, accts, pass) {
    var html = "";
    if (error) {
      bad_login();
      html="Incorrect Password<br>Wait 2 seconds before retrying";
      log("KDBX unlock failed");
    }
    else {
      accts.forEach(function(entry) {
        html += "<li class='acct'>" + entry + "</li>";
      });
      passwords = pass;
      log('***KDBX unlock success***');
    }
  fs.unlink(keyfile, function (err) {
    if (err) {
      throw err;
    }
    console.log("Deleted: " + keyfile);
  });
  next(html);
  });
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

app.get('/style.css', function(req, res) {
  res.sendfile('./public/style.css');
});

app.get('/index.js', function(req, res) {
  res.sendfile('./public/index.js');
});

app.get('/jquery-1.11.0.min.js', function(req, res) {
  res.sendfile('./public/jquery-1.11.0.min.js');
});

// Show password
app.post('/show', function(req, res) {

  // Index from html account list
  var index= req.body.index;

  var html = "<span>Password: " + passwords[index] +"</span>";
  passwords = [];
  res.send(html);
});

// Show account list
app.post('/list', function(req, res) {
  var kdbx_pass = req.body.pass;

  var render = function(html) {
    res.send(html);
  };

  // Array of functions, each passes the result to the next.
  var s = [function(next) { write_tmp_file(clear_key, next); }, function(result, next) { list_accts(kdbx_pass, result, next); } ];
  series.series_on_result(s, render);

});

/*
 * Check if the supplied key properly decrypts the KDBX keyfile
 */

app.post('/auth', function(req, res) {
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

    fs.unlink(cryptfile, function (err) {
      if (err) {
        throw err;
      }
      console.log("Deleted: " + cryptfile);
    });
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


if (process.env.NODE_ENV == "production")
{
  // Use the production keys
  var prefix = "./keys/";

  // Trust heroku's forwarding -- note that this can be spoofed easily
  app.enable('trust proxy');

  var server = app.listen(process.env.PORT || 5000);
  console.log("Server started");
}
else
{
  // This is for testing locally
  var prefix = "./testing/";
  var https = require('https');
  var privateKey  = fs.readFileSync('sslcert/backup_pass-key.pem');
  var certificate = fs.readFileSync('sslcert/public-cert.pem');
  var credentials = {key: privateKey, cert: certificate};
  var httpsServer = https.createServer(credentials, app);
  var server = httpsServer.listen(8443);
  console.log("Server started");
}
