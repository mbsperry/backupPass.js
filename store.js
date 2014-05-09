module.exports = function(session) {
  var Store = session.Store;

  var BPStore = function (options) {
    var sessions = {};
    Store.call(this, options);
  };

  BPStore.prototype = new Store();

  BPStore.prototype.get = function get (sid, callback) {
    var self = this;
    return callback(null, self.sessions.sid);
  };

  BPStore.prototype.set = function set (sid, sess, callback) {
    var self = this;
    self.sessions.sid = sess;
    callback();
  };

  BPStore.prototype.destroy = function destroy (sid, callback) {
    var self = this;
    self.sessions.sid = null;
  };

  BPStore.prototype.test = function(msg) {
    console.log(msg);
  };

  return BPStore;
};

