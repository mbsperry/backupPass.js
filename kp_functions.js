var keepassio = require('keepass.io');

function get_accts(key_db, passwd, keyfile, next) {
  accts = [];
  db = new keepassio();

  db.setCredentials( {
    password: passwd,
    keyfile: keyfile });

  db.load(key_db, function(error, data) {
    if(error) throw error;
    
    // First, select only the "groups" from JSON structure
    var groups = data.groups;
    
    // Get each group entry 
    for (var prop in groups) {
     console.log(groups[prop].entries);

     // each entry has a title, username, password
      for (var entry in groups[prop].entries) {
        accounts = groups[prop];
        console.log(groups[prop].entries[entry].title);
        title = groups[prop].entries[entry].title;
        accts.push(title);
      }

    }

    // Execute callback
    return next(accts);
  });

}

//get_accts('./keepass/test.kdbx', 'a test', './keepass/key.key');

module.exports.get_accts = get_accts;

