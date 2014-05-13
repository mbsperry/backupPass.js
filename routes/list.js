/*
 * Logic for the '/session/secure/list' route
 */

var fs = require('fs');
var kp = require('../lib/kp_functions');
var write_tmp_file = require('../lib/write_tmp_file');
var logger = require('../lib/log');

/*
 * Generates the list of KeePass accounts
 */

var list_accts = function(req, key, keyfile, next) {
  var keydb;

  if (process.env.NODE_ENV == 'test') {
    keydb = './keepass/testing.kdbx';
  } else if (process.env.KEEPASS_PATH) {
    keydb = process.env.KEEPASS_PATH;
  } else {
    keydb = './keepass/keepass.kdbx';
  }
  
  var make_acct_list = function(err, accts) {
    var acctNames = [];
    if (err) {
      logger.log("KDBX unlock failed");
      return next(new Error("bad_login"));
    }
    else {
      accts.forEach(function(entry) {
        acctNames.push(entry.title);
      });
      logger.log('***KDBX unlock success***');
    }
    fs.unlink(keyfile, function (err) {
      if (err) {
        throw err;
      }
      console.log("Deleted: " + keyfile);
    });

    req.session.accts = accts;
    next(null, acctNames);
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

  write_tmp_file(req.session.clear_key, function cb(path) {
    list_accts(req, kdbx_pass, path, render);
  });
};
