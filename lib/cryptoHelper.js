// cryptoHelper.js

var crypto = require('crypto');
var fs = require('fs');
var logger = require('./log');

/*
 * Private
 */

var encrypt = function (text, key) {
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};

/*
 * Private
 */

var decrypt = function (text, key) {
  var decipher = crypto.createDecipher('aes-256-cbc',key);
  try {
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    logger(2, "Decryption success!");
    return dec;
  } catch (err) {
    return false;
  }
};

/* 
 * Public API
 * This is only ever called during setup, so synchronous makes sense
 */
var write_encrypted_phrase = function (phrase, hash, filename) {
  var c = encrypt(phrase, hash);
  fs.writeFileSync(filename, c, 'hex', function (err) {
    if (err) throw err;
    logger(2, 'Saved File');
  });
};

/* 
 * Public API
 * Currently sync, should be async...
 */

var decrypt_phrase = function (key, file) {
  logger(2, "Decrypting: " + file);
  try {
    var crypt = fs.readFileSync(file, 'hex');
    var phrase = decrypt(crypt, key);
    return phrase;
  } catch (err) {
    return false;
  }
};

// Only used by setup.js
module.exports.write_encrypted_phrase = write_encrypted_phrase;

// Required throughout
module.exports.decrypt_phrase = decrypt_phrase;

