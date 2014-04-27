var mc = require('./my_crypto.js');
var fs = require('fs');
var crypto = require('crypto');

// This is the KDBX keyfile
var key_file = fs.readFileSync("./keepass/key.key", 'utf8');

var i = 0;
var keys = [];

var get_keys = function (next) {
  // Generate a 256 bit random key
  crypto.randomBytes(32, function(ex, buf) {
    keys.push(buf.toString('hex'));
    if (i<5) {
      i++;
      get_keys(next);
    }
  });

  // Loop 5 times recursively until there are 5 keys in the array 
  if (i>4) {
    next();
  }
};

get_keys(function () {
  console.log(keys.length);

  // Make 5 different crypt files
  // Each file is the KDBX keyfile encrypted with one of the new random keys
  for (var c = 0; c<5; c++) {
    filename = "./key" + c + ".crypt";
    mc.write_encrypted_phrase(key_file, keys[c], filename);
    console.log("Writing: " + filename);
    console.log("Key: " + keys[c]);
  }
});
