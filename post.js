var fs = require('fs');
var kp = require('./kp_functions');
var write_tmp_file = require('./write_tmp_file');
var logger = require('./log');

/*
 * Generates the list of KeePass accounts
 */

var list_accts = function(req, key, keyfile, next) {
  
  var make_acct_list = function(err, accts) {
    var acctNames = [];
    if (err) {
      logger.log("KDBX unlock failed");
      next(new Error("oh no!"));
      req.bad_login();
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

  kp.get_accts('./keepass/test.kdbx', key, keyfile, make_acct_list);

};

module.exports.list = function (req, res, next) {
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

module.exports.show = function (req, res, next) {
  // Index from html account list
  var index= req.body.index;

  var acct_notes = req.session.accts[index].notes.split('\n').join('<br>');
  var result = {
    username: req.session.accts[index].username,
    password: req.session.accts[index].password,
    notes: acct_notes
  };

  // Delete all session data
  req.session.accts = null;
  req.session = null;

  // Send the account information
  res.send(result);
};
