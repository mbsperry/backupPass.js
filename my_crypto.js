var crypto = require('crypto');
var fs = require('fs');

//var key = fs.ReadFileSync('key.txt');

var make_hash = function (key, next) {

  var file_s = fs.ReadStream('./app.js');

  hmac = crypto.createHmac('sha1', key);

  file_s.on('data', function (data) {
    hmac.update(data);
  });

  file_s.on('end', function() {
    hash = hmac.digest('hex');
    next(hash);
  });
};

var encrypt = function (text, key) {
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};

var decrypt = function (text, key) {
  var decipher = crypto.createDecipher('aes-256-cbc',key);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
};

var write_encrypted_phrase = function (phrase, hash) {
  var c = encrypt(phrase, hash);
  fs.writeFileSync('hash.crypt', c, 'hex', function (err) {
    if (err) throw err;
    console.log('Saved File');
  });
};

var decrypt_phrase = function (key, next) {
  var crypt = fs.readFileSync('hash.crypt', 'hex');
  make_hash(key, function(hash) {
    var phrase = decrypt(crypt, hash);
    console.log(phrase);
    next(phrase);
  });
};


module.exports.make_hash = make_hash;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.write_encrypted_phrase = write_encrypted_phrase;
module.exports.decrypt_phrase = decrypt_phrase;

