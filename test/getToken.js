/*
 * Fetches a CSRF token from the server
 * Public API
 */

module.exports = function (agent, next) {
  agent
  .get('/session')
  .end(function(err, res) {
    if (err) return next(err);
    var csrfToken = res.body.Token;
    agent.saveCookies(res);
    return next(null, csrfToken);
  });
};
