var fs = require('fs');
var bodyParser = require('body-parser');
var tmp = require('tmp');

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
var clear_key = "";

var write_tmp_file = function (data, next) {
  tmp.file(function _tempFileCreated(err, path, fd) {
    if (err) throw err;

    console.log("File: ", path);
    console.log("File descriptor: ", fd);

    fs.writeFileSync(path, data, 'utf8');
    next(path);
  });
};

var list_accts = function(key, keyfile, next) {
  kp.get_accts('./keepass/test.kdbx', key, keyfile, function(error, accts, pass) {
    if (error) {
      html="Incorrect Password";
    }
    else {
      html = '<ul> ';
      accts.forEach(function(entry) {
        html += "<li id='acct'>" + entry + "</li>";
      });
      html += "</ul>";
      passwords = pass;
    }
  next(html);
  });
};

/*
 *
 *        Routing
 *
 */

app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});

app.get('/style.css', function(req, res) {
  res.sendfile('./public/style.css');
});

app.post('/show', function(req, res) {
  var index= req.body.index;
  html = "<span>Password: " + passwords[index] +"</span>";
  res.send(html);
});

app.post('/list', function(req, res) {
  var kdbx_pass = req.body.pass;

  var render = function(html) {
    res.send(html);
  };
  // List of functions to be executed sequentially
  s = [function(next) { write_tmp_file(clear_key, next); }, function(result, next) { list_accts(kdbx_pass, result, next); } ];

  // This is a little tricky:
  // Takes an array of functions, passes the result from the preceding 
  // onto the next, executes in order.
  // The second argument is the last function to execute, gets the cumulative
  // result of the preceding operations.
  series.series_on_result(s, render);

});

app.post('/auth', function(req, res) {
  var key = req.body.key;
  console.log("Supplied auth: " + key);

  clear_key = my_crypto.decrypt_phrase(key, './key.crypt');
  console.log(clear_key);
  if (clear_key) {
    res.send("true");
  }
  else {
    res.send("false");
  }
 
});


/*
 *
 *        Start the server
 *
 */



console.log('Server started');

// Uncomment below if you want server to respond to non-https requests
// [ ] TODO: Forward non-https to https
// httpServer.listen(5000);

  app.listen(process.env.PORT || 5000);
  //var http = require('http');
  //var https = require('https');
  //// Define SSL stuff
  //var privateKey  = fs.readFileSync('sslcert/backup_pass-key.pem');
  //var certificate = fs.readFileSync('sslcert/public-cert.pem');
  //var credentials = {key: privateKey, cert: certificate};
  //var httpServer = http.createServer(app);
  //var httpsServer = https.createServer(credentials, app);
  //httpsServer.listen(443);
