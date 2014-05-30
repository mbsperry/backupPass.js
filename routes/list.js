/*
 * Logic for the '/session/secure/list' route
 */

var fs = require('fs')
  , kp = require('../lib/kp_functions')
  , write_tmp_file = require('../lib/write_tmp_file')
  , logger = require('../lib/log')
  , config = require('../lib/config')
  , twilio = require('../lib/twilio')

/*
 * Generates the list of KeePass accounts
 */

function list_accts (req, key, keyfile, next) {
  var keydb = config.keepass_path
    , make_acct_list

  make_acct_list = function(err, accts) {
    var acctNames = []
    if (err) {
      logger(3, "KDBX unlock failed")
      if (err.message == 'Master key invalid.') {
        return next(new Error("BAD_LOGIN"))
      } else {
        return next(err)
      }
    }
    else {
      accts.forEach(function(entry) {
        acctNames.push(entry.title)
      })
      logger(3, '***KDBX unlock success***')
      if (config.useTwilio) {
        twilio("KDBX unlocked: " + req.ip)
      }
    }
    fs.unlink(keyfile, function (err) {
      if (err) {
        return next(err)
      }
      logger(2, "Deleted: " + keyfile)
    })

    req.session.accts = accts
    return next(null, acctNames)
  }

  kp.get_accts(keydb, key, keyfile, make_acct_list)

}

module.exports = function (req, res, next) {
  var kdbx_pass = req.body.pass
    , render

  render = function(err, acctNames) {
    if (err) {
      return next(err)
    }
    res.json(acctNames)
  }

  write_tmp_file(req.session.clearKey, function cb(err, path) {
    if (err) return next(err)
    list_accts(req, kdbx_pass, path, render)
  })
}
