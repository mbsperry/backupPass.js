/*
 * Logic for the '/session/secure/show' route
 */

module.exports = function (req, res, next) {
  // Index from html account list
  var index= req.body.index
    , acct_notes = req.session.accts[index].notes.split('\n').join('<br>')
    , result = {
        username: req.session.accts[index].username,
        password: req.session.accts[index].password,
        notes: acct_notes
      }

  // Delete all session data
  //req.session.accts = null
  //req.session = null
  req.session.destroy()

  // Send the account information
  res.send(result)
}

