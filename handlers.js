
var bad_login = function() {
  login_attempts += 1;
  login_pause = true;

  setTimeout(function() {
    login_pause = false;
  }, 2000);

  if (login_attempts > 2) {
    lockout = true;
    server.close();
    fs.writeFile('./lockfile', 'Server locked', function write(err) {
      if (err) 
        throw err;
    });
    log('Server locked');
  }
};


module.exports.bad_login = bad_login;
