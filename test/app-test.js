/*global describe, it */

var request = require('supertest');
var should = require('should');
var fs = require('fs');
var path = require('path');


//request = request('http://localhost:8000');
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


var basepath = __dirname;

var copyfile = function(file) {
  var basename = path.basename(file);
  var filepath = basepath + '/data/keys/' + file;
  try {
    fs.writeFileSync(basepath + '/../testing/' + basename, fs.readFileSync(filepath));
  } catch (err) {
    throw err;
  }
};

var app;
var agent;


before(function(done) {
  this.timeout(4000);
  // Delete a lockfile if it exists
  try {
    console.log("Deleting lockfile");
    fs.unlinkSync(basepath + '/../lockfile');
  } catch (err) {
    console.log("No lockfile");
  }

  // Must start app after lockfile has been deleted
  app = require('../app.js');
  agent = request.agent(app);

  fs.readdir(basepath + '/data/keys', function(err, files) {
    files.forEach(copyfile);

    try {
      fs.writeFileSync(basepath + '/../keepass/testing.kdbx', fs.readFileSync(basepath + '/data/testing.kdbx'));
    done();
    } catch (err) {
      throw err;
    }

  });

});

describe('index', function() {
  it('should return 200', function(done) {
    agent
    .get('/')
    .expect(200)
    .end(function(err,res) {
      should.not.exist(err);
      done();
    });
  });
});

describe('authenticate with key', function() {
  it('should should return true', function(done) {
    agent
    .post('/session/auth')
    .send({ key: '245871dde31a9fb81f76745f279b6b161501b8e41c1ad05fa88f65481d19f2c4' })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect({ response: true }, done);
  });

  it('should return 401 with invalid key', function(done) {
    agent
    .post('/session/auth')
    .send({ key: 'invalid key' })
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

  it('should return false with a repeated key', function(done) {
    this.timeout(4000);
    setTimeout(function() {
      // Need to wait for the bad login timeout...
      agent
      .post('/session/auth')
      .send({ key: '245871dde31a9fb81f76745f279b6b161501b8e41c1ad05fa88f65481d19f2c4' })
      .expect('Content-Type', /json/)
      .expect(401, done);
    }, 2003);
  });
});

describe('Authenticate with correct password', function() {
  this.timeout(4000);
  
  before(function(done) {
    var waitTime = 2003;
    // Make sure to delete the lockfile if it exists
    try {
      fs.unlinkSync(basepath + '/lockfile');
    } catch (err) {
    }
    // Need to suppy a valid key before each password test
    setTimeout(function() {
      // Make sure to wait through timeout from last bad login
      copyfile('key0.crypt');
      agent
      .post('/session/auth')
      .send({ key: '245871dde31a9fb81f76745f279b6b161501b8e41c1ad05fa88f65481d19f2c4' })
      .end(function(err, res) {
        agent.saveCookies(res);
        done();
      });
    }, waitTime);
    waitTime = 0;
  });

  it('Should return an array with a correct password', function(done) {
    agent
    .post('/session/secure/list')
    .send({ pass: 'a test' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      agent.saveCookies(res);
      res.body.should.be.instanceof(Array);
      done();
    });
  });

  it('should return an account object when given an index', function(done) {
    agent
    .post('/session/secure/show')
    .send({ index: 1})
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      res.body.should.be.instanceof(Object);
      res.body.username.should.be.instanceof(String);
      res.body.password.should.be.instanceof(String);
      res.body.notes.should.be.instanceof(String);
      done();
    });

  });

});

describe('Authenticate with incorrect password', function() {

  before(function(done) {
    // Make sure to delete the lockfile if it exists
    try {
      fs.unlinkSync(basepath + '/lockfile');
    } catch (err) {
    }
    // Need to suppy a valid key before each password test
    // Make sure to wait through timeout from last bad login
    copyfile('key0.crypt');
    agent
    .post('/session/auth')
    .send({ key: '245871dde31a9fb81f76745f279b6b161501b8e41c1ad05fa88f65481d19f2c4' })
    .end(function(err, res) {
      agent.saveCookies(res);
      done();
    });
  });

  it('Should return an 401 with an incorrect password', function(done) {
    agent
    .post('/session/secure/list')
    .send({ pass: 'incorrect password' })
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

});

after(function(done) {
  var testdb = basepath + '/../keepass/testing.kdbx';
  fs.unlink(testdb, function(err) {
    if (err) throw err;
    done();
  });
});
