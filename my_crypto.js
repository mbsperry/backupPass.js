// my_crypto.js
// Defines backup.pass specific cryptographic functions

var crypto = require('crypto');
var fs = require('fs');

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

// This is only ever called during setup, so synchronous makes sense
var write_encrypted_phrase = function (phrase, hash, filename) {
  var c = encrypt(phrase, hash);
  fs.writeFileSync(filename, c, 'hex', function (err) {
    if (err) throw err;
    console.log('Saved File');
  });
};

// This should probably be converted to asynchronous...
var decrypt_phrase = function (key, file, next) {
  console.log("Decrypting: " + file);
  try {
    var crypt = fs.readFileSync(file, 'hex');
    var phrase = decrypt(crypt, key);
    console.log("Clear phrase: " + phrase);
    return phrase;
  } catch (err) {
    return false;
  }
};


module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.write_encrypted_phrase = write_encrypted_phrase;
module.exports.decrypt_phrase = decrypt_phrase;

