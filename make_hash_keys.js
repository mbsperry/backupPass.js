var mc = require('./my_crypto.js');
var fs = require('fs');

var key = "a test";
var key_file = fs.readFileSync("./keepass/key.key", 'utf8');

mc.make_hash(key, function (hash) {
  console.log(hash);

  mc.write_encrypted_phrase("My little secret", key, 'hash.crypt');
  mc.decrypt_phrase(key, 'hash.crypt', function(phrase) {
      console.log(phrase);
  });

  mc.write_encrypted_phrase(key_file, key, 'key.crypt');
  console.log(key_file);
  mc.decrypt_phrase(key, 'key.crypt', function(phrase) {
    console.log(phrase);
  });
});



