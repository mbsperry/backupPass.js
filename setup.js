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

var mc = require('./lib/my_crypto.js');
var fs = require('fs');
var crypto = require('crypto');

var prefix;
var filename;
var delete_keys;

// This is the KDBX keyfile
var key_file = fs.readFileSync("./do_not_include/key.key", 'utf8');

var production = false;
if (process.argv[2] == "production") {
  prefix = "./keys/";
  production = true;
} else {
  prefix = "./testing/";
}

if (process.argv[3]) {
  delete_keys = process.argv[3];
} else {
  delete_keys = true;
}

var make_config = function(delete_keys, prefix) {
  var session_keys = [];

  var make_session_keys = function(next) {
    crypto.randomBytes(32, function(ex, buf) {
      session_keys.push(buf.toString('hex'));
        if (session_keys.length < 3) {
          make_session_keys(next);
        } else {
          next();
        }
    });
  };


  var write_config = function() {
    console.log("Writing config file");
    var config = {
      mode: process.argv[2],
      delete_key_files: delete_keys,
      key_prefix: prefix,
      sessionKeys: session_keys
    };

    fs.writeFile("./config.json", JSON.stringify(config), function(err) {
      if (err) throw err;
    });
  };

  make_session_keys(write_config);

};

make_config(delete_keys, prefix);



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
