var mc = require('./my_crypto.js');
var fs = require('fs');
var crypto = require('crypto');

//var key = "a test";
//try {
  //buf = crypto.randomBytes(32);
//} catch (ex) {
  //throw ex;
//}

//var key = buf.toString('hex');
//console.log(key);

var key_file = fs.readFileSync("./keepass/key.key", 'utf8');

var i = 0;
var keys = [];

var get_keys = function (next) {
  crypto.randomBytes(32, function(ex, buf) {
    keys.push(buf.toString('hex'));
    if (i<5) {
      i++;
      get_keys(next);
    }
  });
  if (i>4) {
    next();
  }
};

get_keys(function () {
  console.log(keys.length);

  for (var c = 0; c<5; c++) {
    filename = "./key" + c + ".crypt";
    mc.write_encrypted_phrase(key_file, keys[c], filename);
    console.log("Writing: " + filename);
    console.log("Key: " + keys[c]);
  }


});
/*

});
*/


