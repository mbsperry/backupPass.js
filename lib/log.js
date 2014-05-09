var fs = require('fs');

var logfile = './log.txt';

var log = function() {
  var logstring = new Date();
  for (var i in arguments) {
    logstring += '\n' + arguments[i];
  }
  logstring += '\n\n';
  fs.appendFile(logfile, logstring, function (err) {
    if (err)
    throw err;
  });
};

module.exports.log = log;
