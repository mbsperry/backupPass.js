/*
 * Logic for the '/session/auth' route
 */

var log = require('../lib/log');
var config = require('../lib/config');
var cryptHelp = require('../lib/cryptoHelper');
var fs = require('fs');

module.exports = function (req, res, next) {
  var cryptfile;
  var key_prefix = config.key_prefix;
  var key = req.body.key;

  var logreq = req.ip + ': Decryption request';
  var logdata = 'Supplied key: ' + key;

  // Try to decrypt each of the 5 key files
  fs.readdir(key_prefix, function(err, files) {
    files.some(function(file) {

      // false if decyption fails
      var test_key = cryptHelp.decrypt_phrase(key, key_prefix + file);
      if (test_key) {
        cryptfile = key_prefix + file;
        req.session.clear_key = test_key;
        return true;
      }
      else {
        // Must set this explicitly to avoid memory
        req.session.clear_key = false;
        return false;
      }
    });

    // Was the key properly decrypted?
    if (req.session.clear_key) {
      logdata += '\n***Decryption success***';
      log.log(logreq, logdata);

      fs.unlink(cryptfile, function (err) {
        if (err) {
          return next(err);
        }
      });

      req.session.login = true;
      res.send({ response: true });
    }
    else {
      logdata += '\nDecryption failed';
      log.log(logreq, logdata);
      next(new Error("BAD_LOGIN"));
    }
  });
};
