
var undefined
  , slice = [].slice
  , join = require('path').join
  , fs = require('fs')
  , rimraf = require('rimraf')
  , should = require('should')
  , Rext = require('../lib/rext.js')
  ;

function noopErr (err) {
  if (err) done(err);
}

function throwTest (f) {
  var params = slice.call(arguments, 1);

  should.throws(function () {
    f.apply(null, params);
  });
}

function throwTestMessage (f, message) {
  var params = slice.call(arguments, 2);

  should.throws(function () {
    f.apply(null, params);
  }, function (err) {
    if ((err instanceof Error) && err.message === message) {
      return true;
    }
  });
}

function streamToString (stream, callback) {
  var buffer = []
    , bodyLen = 0
    , doc = '';
    ;
    
  stream.on('data', function (chunk) {
    buffer.push(chunk);
    bodyLen += chunk.length;
  })
  
  stream.on('end', function () {
    if (buffer.length && Buffer.isBuffer(buffer[0])) {
      var body = new Buffer(bodyLen)
        , i = 0
        ;
      buffer.forEach(function (chunk) {
        chunk.copy(body, i, 0, chunk.length);
        i += chunk.length;
      })
      doc = body.toString('utf8');
    } else if (buffer.length) {
      doc = buffer.join('');
    }
    callback(doc);
  })
}

describe('Rext', function () {

  var repositoryPath = './test/test-repository'
    , filename = Rext.FILENAME
    , latestDir = Rext.LATEST_DIR
    , service1 = 'service1'
    , s1version001 = '0.0.1'
    , s1v001doc = {
        'service': 'service1'
      , 'version': s1version001
      , 'description': 'Service1 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service1.com/1'
      }
    , s1v001docStr = JSON.stringify(s1v001doc)
    , s1version002 = '0.0.2'
    , s1v002doc = {
        'service': service1
      , 'version': s1version002
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , s1v002docStr = JSON.stringify(s1v002doc)
    , s1version003 = '0.0.3'
    , s1v003doc = {
        'service': service1
      , 'version': s1version003
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , s1v003docStr = JSON.stringify(s1v003doc)
    , service1Path = join(repositoryPath, service1)
    , s1version001Path = join(service1Path, s1version001)
    , s1version002Path = join(service1Path, s1version002)
    , s1version003Path = join(service1Path, s1version003)
    , s1v001docPath = join(s1version001Path, filename)
    , s1v002docPath = join(s1version002Path, filename)
    , s1v003docPath = join(s1version003Path, filename)
    , s1latestPath = join(service1Path, latestDir)
    , s1latestdocPath = join(s1latestPath, filename)
    , service2 = 'service2'
    , s2version001 = '0.0.1'
    , s2v001doc = {
        'service': service2
      , 'version': s2version001
      , 'description': 'Service2 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service2.com/1'
      }
    , s2v001docStr = JSON.stringify(s2v001doc)
    , service2Path = join(repositoryPath, service2)
    , s2version001Path = join(service2Path, s2version001)
    , s2v001docPath = join(s2version001Path, filename)
    , s2latestPath = join(service2Path, latestDir)
    , s2latestdocPath = join(s2latestPath, filename)
    , service3 = 'brandNewService'
    , s3version001 = '0.0.1'
    , service3Path = join(repositoryPath, service3)
    , s3version001Path = join(service3Path, s3version001)
    , s3v001docPath = join(s3version001Path, filename)
    , s3latestPath = join(service3Path, latestDir)
    , s3latestdocPath = join(s3latestPath, filename)
    , s3v001docStr = 'this is a brand new service!'
    , tests3v001Path = join('./test', 'tests3v001.txt')
    , tests1v003Path = join('./test', 'tests1v003.txt')
    , rext
    ;

  beforeEach(function (done) {
    fs.mkdirSync(repositoryPath);
    fs.mkdirSync(service1Path);
    fs.mkdirSync(s1version001Path);
    fs.writeFileSync(s1v001docPath, JSON.stringify(s1v001doc));
    fs.mkdirSync(s1version002Path);
    fs.writeFileSync(s1v002docPath, JSON.stringify(s1v002doc));
    fs.symlinkSync(s1version002, s1latestPath);
    fs.mkdirSync(service2Path);
    fs.mkdirSync(s2version001Path);
    fs.writeFileSync(s2v001docPath, JSON.stringify(s2v001doc));
    fs.symlinkSync(s2version001, s2latestPath);
    fs.writeFileSync(tests1v003Path,s1v003docStr);
    fs.writeFileSync(tests3v001Path,s3v001docStr);
    rext = new Rext(repositoryPath);
    done();
  });

  afterEach(function (done) {
    rimraf.sync(repositoryPath);
    fs.unlinkSync(tests1v003Path);
    fs.unlinkSync(tests3v001Path);
    
    done();
  });

  describe('.create', function () {
    it('creates a new version of document in the repository that become the latest', function (done) {
      var readStream = fs.createReadStream(tests1v003Path);
      readStream.pause();
      rext.create({
        name: service1
      , version: s1version003
      , data: readStream
      }, function (err) {
        if (err) done(err);

        var created = fs.readFileSync(s1v003docPath).toString('utf-8');
        created.should.equal(s1v003docStr);

        var latest = fs.readFileSync(s1latestdocPath).toString('utf-8');
        latest.should.equal(s1v003docStr.toString('utf-8'));

        var unchanged1 = fs.readFileSync(s1v002docPath).toString('utf-8');
        unchanged1.should.equal(s1v002docStr.toString('utf-8'));

        var unchanged2 = fs.readFileSync(s1v001docPath).toString('utf-8');
        unchanged2.should.equal(s1v001docStr.toString('utf-8'));

        done();
      });
    });

    it('creates the first document version in the repository', function (done) {
      var readStream = fs.createReadStream(tests3v001Path);
      readStream.pause();
      rext.create({
        name: service3
      , version: s3version001
      , data: readStream
      }, function (err) {
        if (err) done(err);

        var created = fs.readFileSync(s3v001docPath).toString('utf-8');
        created.should.equal(s3v001docStr);

        var latest = fs.readFileSync(s3latestdocPath).toString('utf-8');
        created.should.equal(s3v001docStr);

        done();
      });
    });

    it('returns an error if document version is older the latest one', function (done) {
      rext.create({
        name: service1
      , version: '0.0.1'
      , data: s1v003docStr
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('returns an error if document version not well formed', function (done) {
      rext.create({
        name: service1
      , version: '0r.0.1'
      , data: s1v003docStr
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

/*
    it('returns an error if document name is not valid', function (done) {
      rext.create({
        name: '?*strangeservice*'
      , version: s1version003
      , data: s1v003docStr
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });
*/



    it('throws an error if document name is not passed', function (done) {
      var options = {
            version: s1version003
          , data: s1v003docStr
          };

      throwTestMessage(rext.create, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

    it('throws an error if document version is not passed', function (done) {
      var options = {
            name: service1
          , data: s1v003docStr
          };

      throwTestMessage(rext.create, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

    it('throws an error if document data is not passed', function (done) {
      var options = {
            name: service1
          , version: s1version003
          };

      throwTestMessage(rext.create, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

  });

  describe('.list', function () {

    it('lists all document names if nothing but callback is passed', function (done) {
      rext.list(function (err, data) {
        if (err) done(err);

        data.should.have.lengthOf(2);
        data.should.include(service1);
        data.should.include(service2);

        done();
      });
    });

    it('lists all version strings of a document, but \'latest\', if document name is passed', function (done) {
      rext.list(service1, function (err, data) {
        if (err) done(err);

        data.should.have.lengthOf(2);
        data.should.include(s1version001);
        data.should.include(s1version002);

        done();
      });
    });

    it('returns an error if a not-existing document name is passed', function (done) {
      rext.list('falseService', function (err, data) {
        err.should.be.an.instanceof(Error);
        
        done();
      });
    });

  });

  describe('.destroy', function () {

    it('destroys a document', function (done) {
      rext.destroy({
        name: service1
      }, function (err) {
        if (err) done(err);

        fs.existsSync(s1v001docPath).should.not.be.true;
        fs.existsSync(s1v002docPath).should.not.be.true;
        fs.existsSync(s1latestdocPath).should.not.be.true;
        fs.existsSync(service1Path).should.not.be.true;

        fs.existsSync(s2v001docPath).should.be.true;

        done();
      })
    });

    it('returns an error if not-existing document name is passed', function (done) {
      rext.destroy({
        name: 'falseService'
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('throws an error if document name is not passed', function (done) {
      var options = {};

      throwTestMessage(rext.destroy, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

  });

  describe('.retrieve', function () {

    it('retrieves specific version of a document', function (done) {
      rext.retrieve({
        name: service1
      , version: s1version001
      }, function (err, stream) {
        if (err) done(err);
        streamToString(stream, function (doc) {
          doc.should.equal(s1v001docStr.toString('utf8'));
          done();
        })
      });
    });

    it('retrieves latest version of a document if version is not passed', function (done) {
      rext.retrieve({
        name: service1
      }, function (err, stream) {
        if (err) done(err);
        
        streamToString(stream, function (doc) {
          doc.should.equal(s1v002docStr.toString('utf8'));
          done();
        })
        
      });
    });

    it('returns an error if not-existing document name is passed', function (done) {
      rext.retrieve({
        name: 'falseService'
      , version: s1version002
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('returns an error if not-existing document version is passed', function (done) {
      rext.retrieve({
        name: service1
      , version: '1.0.6'
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('returns an error if document version not well formed', function (done) {
      rext.create({
        name: service1
      , version: '0r.0'
      , data: s1v003docStr
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('throws an error if document name is not passed', function (done) {
      var options = {
            version: s1version002
          };

      throwTestMessage(rext.retrieve, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

  });

  describe('.update', function () {

    it('updates latest version of a document with multiple versions', function (done) {
      var readStream = fs.createReadStream(tests1v003Path);
      readStream.pause();
      
      rext.update({
        name: service1
      , data: readStream
      }, function (err) {
        if (err) done(err);

        var latest = fs.readFileSync(s1latestdocPath).toString('utf-8');
        latest.should.equal(s1v003docStr);

        var updated = fs.readFileSync(s1v002docPath).toString('utf-8');
        updated.should.equal(s1v003docStr);

        var unchanged1 = fs.readFileSync(s1v001docPath).toString('utf-8');
        unchanged1.should.equal(s1v001docStr);

        var uncheanged2latest = fs.readFileSync(s2latestdocPath).toString('utf-8');
        uncheanged2latest.should.equal(s2v001docStr);

        var unchanged2 = fs.readFileSync(s2v001docPath).toString('utf-8');
        unchanged2.should.equal(s2v001docStr);

        done();
      });
    });

    it('updates latest version of a document with single version', function (done) {
      var readStream = fs.createReadStream(tests1v003Path);
      readStream.pause();
      
      rext.update({
        name: service2
      , data: readStream
      }, function (err) {
        if (err) done(err);

        var latest = fs.readFileSync(s2latestdocPath).toString('utf-8');
        latest.should.equal(s1v003docStr);

        var updated = fs.readFileSync(s2v001docPath).toString('utf-8');
        updated.should.equal(s1v003docStr);

        var unchanged1 = fs.readFileSync(s1v001docPath).toString('utf-8');
        unchanged1.should.equal(s1v001docStr);

        var uncheanged2latest = fs.readFileSync(s1latestdocPath).toString('utf-8');
        uncheanged2latest.should.equal(s1v002docStr);

        var unchanged2 = fs.readFileSync(s1v002docPath).toString('utf-8');
        unchanged2.should.equal(s1v002docStr);

        done();
      });
    });

    it('returns an error if not-existing document name is passed', function (done) {
      var readStream = fs.createReadStream(tests1v003Path);
      readStream.pause();
      
      rext.update({
        name: 'false-service'
      , version: s1version001
      , data: readStream
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('throws an error if document name is not passed', function (done) {
      var options = {
            version: s1version002
          , data: s1v003docStr
          };

      throwTestMessage(rext.update, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

    it('throws an error if document data is not passed', function (done) {
      var options = {
            name: service1
          , version: s1version002
          };

      throwTestMessage(rext.update, Rext.errors.BAD_ARGUMENTS, options, noopErr);

      done();
    });

  });
});