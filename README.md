Backup.Pass
==========

A simple personal KeePass backup web server.

## About

Backup.Pass aims to supply a little peace of mind to those of use
who use KeePass. Syncing to a phone works well to have access to
passwords when away from the home computer, but what happens when
the phone battery dies or the phone gets lost?

Backup.Pass attempts to address this issue by providing a small,
personal web server which can access the KeePass database. This is
meant to be a secure, *emergency* backup server.

## Security

Backup.Pass is not meant to be used on a regular basis.

- Five one-time use encryption keys are generated on setup.
- Each key is used to encrypt a separate copy of the KeePass
encryption key 
- Everytime a key is used, it is deleted.
- Once the KeePass database key is decrypted, the used still must
supply the 
