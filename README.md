backupPass
==========

A simple personal KeePass backup web server built with node.js and
[keepass.io](https://github.com/NeoXiD/keepass.io)

[![Build Status](https://travis-ci.org/mbsperry/backupPass.js.svg?branch=master)](https://travis-ci.org/mbsperry/backupPass.js)

## About

backupPass aims to supply a little peace of mind to those of use
who use KeePass. Syncing to a phone works well to have access to
passwords when away from the home computer, but what happens when
the phone battery dies or the phone gets lost?

Backup.Pass attempts to address this issue by providing a small,
personal web server which can access the KeePass database. This is
meant to be a secure, *emergency* backup server with *limited* access
to your passwords.

## Security

backupPass is not meant to be used on a regular basis. The features
below are designed to minimize exposure if either your server is
compromised or your backup keys fall into the wrong hands:

- Five one-time use encryption keys are generated on setup.
- Each key is used to encrypt a separate copy of the KeePass
encryption key file. 
- Every time a key is used, it is deleted.
- Once the KeePass database key file is decrypted, the user still must
supply the KeePass password to unlock the database.
- After 3 incorrect attempts: 
   - The server shuts down.
   - All remaining keyfiles are deleted.
- Unencrypted Keepass database keys are not stored on the server.
- The Keepass password is never stored in any form.
- The server only allows access to one account per key.

## Dependencies

- [KeePass.io](https://github.com/NeoXiD/keepass.io)
- ExpressJS
- body-parser
- node-tmp
- cookierParser
- express-session
- helmet
- csurf

The front end is built on jquery, with the source included in the
distribution. Nothing is loaded over CDN's.

Development dependencies:

- mocha
- should
- supertest

## Install

```bash
$> git clone https://github.com/mbsperry/backupPass.js.git
$> cd backupPass.js
$> mkdir do_not_include
```

## Setup

- Copy keepass database to `./keepass.kdbx`
- Copy keepass database key file to `./do_not_include/key.key`
- Build backup.pass keys:

```bash
$> node setup.js production
```

- **Print and keep the one-time keys with you.** They won't do you any good unless you have them when you need them!

## Run


```bash
$> node app.js
```

- Requires running behind https capable proxy.
- Or deploy to your favorite PaaS.

## Options

Stored as env variables. If running locally, can be stored in
`config.json`. See `lib/config.js` for details.

- `NODE_ENV = 'production'`
    - Stores encrypted keyfiles in `./keys/`
    - Expects to run behind a proxy. 
- `NODE_ENV = 'test'`
    - Stores encrypted keyfiles in `./testing/`
    - Starts self-signed https server
    - loads keepass database from `./keepass/testing.kdbx`
- `REDIRECT`
    - `default = false`: Redirects http requests to https. Default is to ignore all http requests.
- `KEEPASS_PATH`
    - Specifies alternate path for keepass database
- `LOG_LEVEL`
    - `Default: quiet`: Minimal logging to the console. Logins and error messages get logged to `log.txt`.
    - `"verbose"`

## Compatibility

- Tested extensively in Chrome
- use `/legacy` route for a rather clunky version that works well in older browsers

## Contact

Feedback is welcome. Issues and pull requests can be submitted via
GitHub. Feel free to fork!
