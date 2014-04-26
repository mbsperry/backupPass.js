var keepassio = require('keepass.io');

function get_accts(key_db, passwd, keyfile, next) {
  accts = [];
  pass = [];
  db = new keepassio();

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
        var title = groups[prop].entries[entry].title;
        var passwd = groups[prop].entries[entry].password;
        accts.push(title);
        pass.push(passwd);
      }

    }

    // Execute callback
    return next(error, accts, pass);
  });

}

//get_accts('./keepass/test.kdbx', 'a test', './keepass/key.key');

module.exports.get_accts = get_accts;

