/* 
 * Returns a new Sessions object
 *
 */

var Sessions = function Sessions() {
  this.session = {}
}

/* 
 * @sessKey: string
 * @clearKey: string
 * public api
 *
 */

Sessions.prototype.createSession = function (sessKey, clearKey) {
  var self = this
    , fiveMinutes = 1000 * 60 * 5
  self.session[sessKey] = {}

  self.session[sessKey].clearKey = clearKey

  // Add a destroy method to each session
  self.session[sessKey].destroy = function () {
    self.session = {}
  }

  self.session[sessKey].checkExpire = (function() {
    setTimeout(function() {
      self.session[sessKey].destroy()
    }, fiveMinutes)
  })()

}

/* 
 * @sessKey: string
 * @next: fn
 * public api
 *
 */

Sessions.prototype.validate = function (sessKey, next) {
  var self = this

  // Throw an error if invalid sessKey was given
  if (self.session[sessKey]) {
    return next(null, self.session[sessKey])
  } else {
    return next(new Error("INVALID_SESSION"))
  }
}

module.exports = (function() {
  return new Sessions()
})()

