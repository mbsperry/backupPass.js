/*
 * Logic for the '/session/auth' route
 */

var logger = require('../lib/log')
  , config = require('../lib/config')
  , cryptHelp = require('../lib/cryptoHelper')
  , fs = require('fs')

module.exports = function (req, res, next) {
  var cryptfile
    , key_prefix = config.key_prefix
    , key = req.body.key
    , logreq = req.ip + ': Decryption request'
    , logdata = 'Supplied key: ' + key

  // Try to decrypt each of the 5 key files
  fs.readdir(key_prefix, function(err, files) {
    files.some(function(file) {

      // false if decyption fails
      var test_key = cryptHelp.decrypt_phrase(key, key_prefix + file)
      if (test_key) {
        cryptfile = key_prefix + file
        req.session.clear_key = test_key
        return true
      }
      else {
        // Must set this explicitly to avoid memory
        req.session.clear_key = false
        return false
      }
    })

    // Was the key properly decrypted?
    if (req.session.clear_key) {
      logdata += '\n***Decryption success***'
      logger(3, logreq, logdata)

      fs.unlink(cryptfile, function (err) {
        if (err) return next(err)
      })

      req.session.login = true
      res.send({ response: true })
    }
    else {
      logdata += '\nDecryption failed'
      logger(3, logreq, logdata)
      next(new Error("BAD_LOGIN"))
    }
  })
}
