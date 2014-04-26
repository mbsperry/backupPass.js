// Not currently using hash of app file, I decided this didn't add much
// to security. Can reconsider later

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
  try {
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};

var write_encrypted_phrase = function (phrase, hash, filename) {
  var c = encrypt(phrase, hash);
  fs.writeFileSync(filename, c, 'hex', function (err) {
    if (err) throw err;
    console.log('Saved File');
  });
};

var decrypt_phrase = function (key, file, next) {
  console.log("Decrypting: " + file);
  var crypt = fs.readFileSync(file, 'hex');
  var phrase = decrypt(crypt, key);
  console.log("Clear phrase: " + phrase);
  return phrase;
  //make_hash(key, function(hash) {
    //var phrase = decrypt(crypt, hash);
    //console.log(phrase);
    //next(phrase);
  //});
};


module.exports.make_hash = make_hash;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.write_encrypted_phrase = write_encrypted_phrase;
module.exports.decrypt_phrase = decrypt_phrase;

