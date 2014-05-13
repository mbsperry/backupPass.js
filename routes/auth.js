/*
 * Logic for the '/session/auth' route
 */

var log = require('../lib/log');
var my_crypto = require('../lib/my_crypto');
var fs = require('fs');
var config = require('../config.json');

module.exports = function (req, res, next) {
  var cryptfile;
  var key = req.body.key;

  var logreq = req.ip + ': Decryption request';
  var logdata = 'Supplied key: ' + key;


  // Try to decrypt each of the 5 key files
  fs.readdir(config.key_prefix, function(err, files) {
    files.some(function(file) {
      debugger;

      // false if decyption fails
      var test_key = my_crypto.decrypt_phrase(key, config.key_prefix + file);
      if (test_key) {
        cryptfile = config.key_prefix + file;
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

      if (config.delete_key_files === true) {
        fs.unlink(cryptfile, function (err) {
          if (err) {
            throw err;
          }
        });
      }
      req.session.login = true;
      res.send({ response: true });
    }
    else {
      logdata += '\nDecryption failed';
      log.log(logreq, logdata);
      next(new Error("bad_login"));
    }
  });
};
