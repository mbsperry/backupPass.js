/*
 *
 *
 * Generates 5 one-time use encryptions of the KDBX keyfile
 * Store the KDBX keyfile as key.key inside the "do_not_include" folder
 *
 * Usage: node make_keys.js [production]
 * If production flag is omitted, testing keys are 
 * generated and stored in ./testing
 *
 * Production flag: store keys in ./key, which is included in repo for
 * deployment
 *
 *
 */

var mc = require('./my_crypto.js');
var fs = require('fs');
var crypto = require('crypto');

var prefix;
var filename;

// This is the KDBX keyfile
var key_file = fs.readFileSync("./do_not_include/key.key", 'utf8');

var production = false;
if (process.argv[2] == "production") {
  prefix = "./keys/";
  production = true;
} else {
  prefix = "./testing/";
}

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

// Delete lockfile, if present
fs.unlink('./lockfile', function (err) {
  if (err) {
    console.log("No lockfile present");
  } else {
    console.log("Lockfile deleted");
  }
});

get_keys(function () {
  console.log(keys.length);

  // Make 5 different crypt files
  // Each file is the KDBX keyfile encrypted with one of the new random keys

  var msg = 'One time keys. Store these someplace safe.\n\n';

  for (var c = 0; c<5; c++) {
    filename = prefix + "key" + c + ".crypt";
    mc.write_encrypted_phrase(key_file, keys[c], filename);
    console.log("Writing: " + filename);
    console.log("Key: " + keys[c]);

    msg += "Key " + (c+1) + ": " + keys[c] + "\n";
  }

  if (production) {
    fs.writeFileSync("./do_not_include/keyset.txt", msg, 'utf8');
  }
});
