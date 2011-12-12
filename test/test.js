
var undefined
  , fs = require('fs')
  , path = require('path')
  , rimraf = require('rimraf')
  , async = require('async')
  , should = require('should')
  , Rext = require('../lib/rext.js')
  ;

function noopErr (err) {
  if (err) done(err);
}

function throwTest (f) {
  var params = Array.prototype.slice.call(arguments, 1);

  should.throws(
    function () {
      f.apply(null, params);
    }
  );
}

describe('Rext', function () {

  var repositoryPath = './test/test-repository'
    , filename = Rext.FILENAME
    , latestDir = Rext.LATESTDIR
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
    , service1Path = path.join(repositoryPath, service1)
    , s1version001Path = path.join(service1Path, s1version001)
    , s1version002Path = path.join(service1Path, s1version002)
    , s1version003Path = path.join(service1Path, s1version003)
    , s1v001docPath = path.join(s1version001Path, filename)
    , s1v002docPath = path.join(s1version002Path, filename)
    , s1v003docPath = path.join(s1version003Path, filename)
    , s1latestPath = path.join(service1Path, latestDir)
    , s1latestdocPath = path.join(s1latestPath, filename)
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
    , service2Path = path.join(repositoryPath, service2)
    , s2version001Path = path.join(service2Path, s2version001)
    , s2v001docPath = path.join(s2version001Path, filename)
    , s2latestPath = path.join(service2Path, latestDir)
    , s2latestdocPath = path.join(s2latestPath, filename)
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

    rext = new Rext(repositoryPath);
    done();
  });

  afterEach(function (done) {
    rimraf.sync(repositoryPath)
    done();
  });

  describe('.create', function () {

    it('creates a new version of document in the repository that become the latest', function (done) {
      rext.create({
        name: service1
      , version: s1version003
      , data: s1v003docStr
      }, function (err) {
        if (err) done(err);

        var created = fs.readFileSync(s1v003docPath).toString('utf-8');
        created.should.equal(s1v003docStr);

        var latest = fs.readFileSync(s1latestdocPath).toString('utf-8');
        created.should.equal(s1v003docStr.toString('utf-8'));

        var unchanged1 = fs.readFileSync(s1v002docPath).toString('utf-8');
        unchanged1.should.equal(s1v002docStr.toString('utf-8'));

        var unchanged2 = fs.readFileSync(s1v001docPath).toString('utf-8');
        unchanged2.should.equal(s1v001docStr.toString('utf-8'));

        done();
      });
    });

    it('creates the first document version in the repository', function (done) {
      var service3 = 'brandNewService'
        , s3version001 = '0.0.1'
        , service3Path = path.join(repositoryPath, service3)
        , s3version001Path = path.join(service3Path, s3version001)
        , s3v001docPath = path.join(s3version001Path, filename)
        , s3latestPath = path.join(service3Path, latestDir)
        , s3latestdocPath = path.join(s3latestPath, filename)
        , s3v001docStr = 'this is a brand new service!'
        ;

      rext.create({
        name: service3
      , version: s3version001
      , data: s3v001docStr
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

      throwTest(rext.create, options, noopErr);

      done();
    });

    it('throws an error if document version is not passed', function (done) {
      var options = {
            name: service1
          , data: s1v003docStr
          };

      throwTest(rext.create, options, noopErr);

      done();
    });

    it('throws an error if document data is not passed', function (done) {
      var options = {
            name: service1
          , version: s1version003
          };

      throwTest(rext.create, options, noopErr);

      done();
    });

  });

  describe('.list', function () {

    it('lists all document names if nothing but callback is passed', function (done) {
      rext.list(function (err, data) {
        if (err) done(err);

        data.should.have.lengthOf(2);
        data.should.contain(service1);
        data.should.contain(service2);

        done();
      });
    });

    it('lists all version strings of a document, but \'latest\', if document name is passed', function (done) {
      rext.list(service1, function (err, data) {
        if (err) done(err);

        data.should.have.lengthOf(2);
        data.should.contain(s1version001);
        data.should.contain(s1version002);

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

        path.existsSync(s1v001docPath).should.not.be.true;
        path.existsSync(s1v002docPath).should.not.be.true;
        path.existsSync(s1latestdocPath).should.not.be.true;
        path.existsSync(service1Path).should.not.be.true;

        path.existsSync(s2v001docPath).should.be.true;

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

      throwTest(rext.destroy, options, noopErr);

      done();
    });

  });

  describe('.retrieve', function () {

    it('retrieves specific version of a document', function (done) {
      rext.retrieve({
        name: service1
      , version: s1version001
      }, function (err, data) {
        if (err) done(err);

        var doc = data.toString('utf-8');
        doc.should.equal(s1v001docStr.toString('utf-8'));

        done();
      });
    });

    it('retrieves latest version of a document if version is not passed', function (done) {
      rext.retrieve({
        name: service1
      }, function (err, data) {
        if (err) done(err);

        var doc = data.toString('utf-8');
        doc.should.equal(s1v002docStr.toString('utf-8'));

        done();
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

    it('throws an error if document name is not passed', function (done) {
      var options = {
            version: s1version002
          };

      throwTest(rext.retrieve, options, noopErr);

      done();
    });

  });

  describe('.update', function () {

    it('updates latest version of a document with multiple versions', function (done) {
      rext.update({
        name: service1
      , data: s1v003docStr
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
      rext.update({
        name: service2
      , data: s1v003docStr
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
      rext.update({
        name: 'false-service'
      , version: s1version001
      , data: s1v003docStr
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

      throwTest(rext.update, options, noopErr);

      done();
    });

    it('throws an error if document data is not passed', function (done) {
      var options = {
            name: service1
          , version: s1version002
          };

      throwTest(rext.update, options, noopErr);

      done();
    });

  });
});