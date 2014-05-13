backup.pass
==========

A simple personal KeePass backup web server built with node.js

## About

backup.pass aims to supply a little peace of mind to those of use
who use KeePass. Syncing to a phone works well to have access to
passwords when away from the home computer, but what happens when
the phone battery dies or the phone gets lost?

Backup.Pass attempts to address this issue by providing a small,
personal web server which can access the KeePass database. This is
meant to be a secure, *emergency* backup server.

## Security

backup.pass is not meant to be used on a regular basis.

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


## Dependencies

- Express
- KeePass.io
- body-parser
- node-tmp
- cookierParser
- express-session
- helmet
- csurf

Development dependencies:

- mocha
- should
- supertest

## Setup

- Copy keepass database to `./keepass/keepass.kdbx`
- Copy keepass database key file to `./do_not_include/key.key`
- Build backup.pass keys:

```bash
node setup.js production
```

- **Print and keep the one-time keys with you.** They won't do you any good unless you have them when you need them!

## Run


```bash
node app.js
```

- Requires running behind https capable proxy.
- Or deploy to your favorite PaaS.

## Options

Stored as env variables

- `NODE_ENV = 'production'`
    - Stores encrypted keyfiles in `./keys/`
    - Expects to run behind a proxy. 
- `NODE_ENV = 'test'`
    - Stores encrypted keyfiles in `./testing/`
    - Starts self-signed https server
    - loads keepass database from `./keepass/testing.kdbx`
- `KEEPASS_PATH`
    - Specifies alternate path for keepass database
