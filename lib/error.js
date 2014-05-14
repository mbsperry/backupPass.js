function badLoginError(msg) {
  this.name = 'BAD_LOGIN';
  this.message = msg;
  this.stack = (new Error()).stack;
}

badLoginError.prototype = new Error();

function invalidSessionError(msg) {
  this.name = 'INVALID_SESSION';
  this.message = msg;
  this.stack = (new Error()).stack;
}

invalidSessionError.prototype = new Error();

module.exports.badLoginError = badLoginError;
module.exports.invalidSessionError = invalidSessionError;
