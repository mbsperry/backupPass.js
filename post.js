module.exports.show = function (req, res, accounts, next) {
  
  // Index from html account list
  var index= req.body.index;

  var acct_notes = accounts[index].notes.split('\n').join('<br>');
  var result = {
    username: accounts[index].username,
    password: accounts[index].password,
    notes: acct_notes
  };

  // Delete all session data
  accounts = null;
  req.session = null;

  // Send the account information
  res.send(result);
};
