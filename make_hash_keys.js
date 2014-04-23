var mc = require('./my_crypto.js');
var fs = require('fs');

var key = "a test";

mc.make_hash(key, function (hash) {
  console.log(hash);

  mc.write_encrypted_phrase("My little secret", hash);
  mc.decrypt_phrase(key, function(phrase) {
      console.log(phrase);
  });
});



