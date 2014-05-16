/*
 * Setup configuration options
 *
 */

var config = {};
var defaults = {
  mode: 'test',
  key_prefix: './testing/',
  keepass_path: './testing_db.kdbx',
  redirect: false,
  logLevel: "verbose"
};

// Try to load config.json
try {
  config = require('../config.json');

} catch (err) {
  // Don't throw an error if file doesn't exist
  if (err.code != 'MODULE_NOT_FOUND') throw err;
}

// If setting wasn't defined in config.json, check to see if ENV setting exists
config.mode = config.mode || process.env.NODE_ENV || defaults.mode;

config.key_prefix = config.key_prefix || process.env.KEY_PREFIX;
// If mode was set to 'production' but key_prefix was not set
// set key_prefix to keys
if (config.mode == 'production' && !config.key_prefix) {
  config.key_prefix = './keys/';
} else {
  config.key_prefix = defaults.key_prefix;
}

config.keepass_path = config.keepass_path || process.env.KEEPASS_PATH;

if (config.mode == 'production' && !config.keepass_path) {
  config.keepass_path = './keepass.kdbx';
} else {
  config.keepass_path = defaults.keepass_path;
}

config.redirect = config.redirect || process.env.BP_REDIRECT || defaults.redirect;

config.logLevel = config.logLevel || process.env.LOG_LEVEL || defaults.logLevel;

module.exports = config;
