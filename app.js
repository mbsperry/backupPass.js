var fs = require('fs');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');

var my_crypto = require('./my_crypto.js');

var privateKey  = fs.readFileSync('sslcert/backup_pass-key.pem');
var certificate = fs.readFileSync('sslcert/public-cert.pem');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();
app.use(bodyParser()); // support for URL-encoded bodies in posts

// your express configuration here
app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});

app.post('/', function(req, res) {
  var key = req.body.key;
  my_crypto.decrypt_phrase(key, function(phrase) {
    var html = 'Your key is: ' + key + '<br>' +
    'You phrase is: ' + phrase;
    console.log(req.body.key);
    res.send(html);
  });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

console.log('Server started');

//httpServer.listen(80);
httpsServer.listen(443);
