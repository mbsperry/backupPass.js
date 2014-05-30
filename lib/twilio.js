var https = require('https')
  , logger = require('./log')
  , config = require('./config')
  , querystring = require('querystring')
  , sid = config.twilioAccountSID
  , token = config.twilioAuthToken

var options = {
  hostname: 'api.twilio.com',
  auth: sid+':'+token,
  path: '/2010-04-01/Accounts/'+sid+'/Messages.json',
  headers: {
    'Accept':'application/json',
    'Accept-Charset': 'utf-8',
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  },
  method: 'POST'
}

module.exports = function(message) {

  var req
    , bodyString
    , body = {
    'From': config.twilioFrom,
    'Body': message,
    'To': config.twilioTo
  }

  bodyString = querystring.stringify(body).toString('utf-8')
  options.headers['Content-Length'] = bodyString.length

  req = https.request(options)

  req.write(bodyString)
  req.end()

  req.on('error', function(e) {
    logger(1, e)
  })
}
