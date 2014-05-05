var log = require('./log.js');
var my_crypto = require('./my_crypto');
var fs = require('fs');
var config = require('./config.json');

exports.check_key = function (req, res, next) {
  var cryptfile = "";
  var key = req.body.key;

  var logreq = req.ip + ': Decryption request';
  var logdata = 'Supplied key: ' + key;

  // Try to decrypt each of the 5 key files
  for (var i = 0; i<5; i++) {
    cryptfile = config.key_prefix + 'key' + i + ".crypt";

    // false if decyption fails
    var test_key = my_crypto.decrypt_phrase(key, cryptfile);
    if (test_key) {
      req.session.clear_key = test_key;
      console.log(req.session.clear_key);
      break;
    }
    else {
      // Must set this explicitly to avoid memory
      req.session.clear_key = false;
    }
  }

  // Was the key properly decrypted?
  if (req.session.clear_key) {
    logdata += '\n***Decryption success***';
    log.log(logreq, logdata);

    if (config.delete_key_files === true) {
      fs.unlink(cryptfile, function (err) {
        if (err) {
          throw err;
        }
        console.log("Deleted: " + cryptfile);
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
};
