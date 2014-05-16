var fs = require('fs');
var config = require('./config');

var logfile = './log.txt';

module.exports = function(levl) {
  var logstring = "";
  for (var i = 1; i<arguments.length; i++ ) {
    if (logstring) logstring += '\n';
    logstring += arguments[i];
  }
  if (levl==1) {
    return console.log(logstring);
  } else if (levl==2) {
    if (config.logLevel == 'verbose') {
      return console.log(logstring);
    } 
  }

  logstring += '\n\n';
  logstring = new Date() + logstring;
  fs.appendFile(logfile, logstring, function (err) {
    if (err)
    throw err;
  });
};

