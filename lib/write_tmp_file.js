/* 
 * Writes data to a tmp file
 * Currently, tmp file does not seem to be cleaned up properly automagically
 * I manually delete the tmp file later
 * This is used to pass the KDBX key to keepassio, since it only accepts
 * it as a file
 */

var fs = require('fs');
var tmp = require('tmp');

module.exports = function (data, next) {
  tmp.file(function _tempFileCreated(err, path, fd) {
    if (err) return next(err);

    fs.writeFileSync(path, data, 'utf8');
    next(null, path);
  });
};

