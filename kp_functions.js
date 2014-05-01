var keepassio = require('keepass.io');

function get_accts(key_db, passwd, keyfile, next) {
  var accts = [];
  var db = new keepassio();

  db.setCredentials( {
    password: passwd,
    keyfile: keyfile });

  db.load(key_db, function(error, data) {
    if(error) {
      return next(error);
    }
    
    // First, select only the "groups" from JSON structure
    var groups = data.groups;
    
    // Get each group entry 
    for (var prop in groups) {

     // each entry has a title, username, password
      for (var entry in groups[prop].entries) {
        accts.push(groups[prop].entries[entry]);
      }

    }

    // Execute callback
    return next(error, accts);
  });

}

module.exports.get_accts = get_accts;

