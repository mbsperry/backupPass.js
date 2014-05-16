/*
 * Logic for the '/session/secure/list' route
 */

var fs = require('fs');
var kp = require('../lib/kp_functions');
var write_tmp_file = require('../lib/write_tmp_file');
var logger = require('../lib/log');
var config = require('../lib/config');

/*
 * Generates the list of KeePass accounts
 */

var list_accts = function(req, key, keyfile, next) {
  var keydb = config.keepass_path;

  var make_acct_list = function(err, accts) {
    var acctNames = [];
    if (err) {
      logger(3, "KDBX unlock failed");
      if (err.message == 'Master key invalid.') {
        return next(new Error("BAD_LOGIN"));
      } else {
        return next(err);
      }
    }
    else {
      accts.forEach(function(entry) {
        acctNames.push(entry.title);
      });
      logger(3, '***KDBX unlock success***');
    }
    fs.unlink(keyfile, function (err) {
      if (err) {
        return next(err);
      }
      logger(2, "Deleted: " + keyfile);
    });

    req.session.accts = accts;
    return next(null, acctNames);
  };

  kp.get_accts(keydb, key, keyfile, make_acct_list);

};

module.exports = function (req, res, next) {
  var kdbx_pass = req.body.pass;

  var render = function(err, acctNames) {
    if (err) {
      return next(err);
    }
    res.json(acctNames);
  };

  write_tmp_file(req.session.clear_key, function cb(err, path) {
    if (err) return next(err);
    list_accts(req, kdbx_pass, path, render);
  });
};
