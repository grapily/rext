
var undefined
  , fs = require('fs')
  , path = require('path')
  , rimraf = require('rimraf')
  , async = require('async')
  , Rext = require('../lib/rext.js')
  ;

describe('Rext', function () {

  var repository_path = 'test/test-repository'
    , filename = 'doc.rext'
    , latest_dir = 'latest'
    , service1 = 'service1'
    , s1version001 = '0.0.1'
    , s1v001desc = {
        'service': 'service1'
      , 'version': s1version001
      , 'description': 'Service1 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service1.com/1'
      }
    , s1v001desc_str = JSON.stringify(s1v001desc)
    , s1v001desc_updated = {
        'service': service1
      , 'version': '0.0.1'
      , 'description': 'Service1 API version 1 updated'
      , 'protocol': 'http'
      , 'url': 'api.service1.com/1'
      }
    , s1v002desc_str = JSON.stringify(s1v002desc)
    , s1version002 = '0.0.2'
    , s1v002desc = {
        'service': service1
      , 'version': s1version002
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , s1v003desc_str = JSON.stringify(s1v003desc)
    , s1version003 = '0.0.3'
    , s1v003desc = {
        'service': service1
      , 'version': s1version003
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , s1v003desc_str = JSON.stringify(s1v003desc)
    , service1_path = path.join(repository_path, service1)
    , s1version001_path = path.join(service1_path, s1version001)
    , s1version002_path = path.join(service1_path, s1version002)
    , s1version003_path = path.join(service1_path, s1version003)
    , s1v001desc_path = path.join(s1version001_path, filename)
    , s1v002desc_path = path.join(s1version002_path, filename)
    , s1v003desc_path = path.join(s1version003_path, filename)
    , s1latest_path = path.join(service1_path, latest_dir)
    , service2 = 'service2'
    , s2version001 = '0.0.1'
    , s2v001desc = {
        'service': service2
      , 'version': s2version001
      , 'description': 'Service2 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service2.com/1'
      }
    , s2v001desc_str = JSON.stringify(s2v001desc)
    , service2_path = path.join(repository_path, service2)
    , s2version001_path = path.join(service2_path, s2version001)
    , s2v001desc_path = path.join(s2version001_path, filename)
    , s2latest_path = path.join(service2_path, latest_dir)
    ;

  beforeEach(function (done) {
    fs.mkdirSync(repository_path);
    fs.mkdirSync(service1_path);
    fs.mkdirSync(s1version001_path);
    fs.writeFileSync(s1v001desc_path, JSON.stringify(s1v001desc));
    fs.mkdirSync(s1version002_path);
    fs.writeFileSync(s1v002desc_path, JSON.stringify(s1v002desc));
    fs.symlinkSync(s1version002, s1latest_path);
    fs.mkdirSync(service2_path);
    fs.mkdirSync(s2version001_path);
    fs.writeFileSync(s2v001desc_path, JSON.stringify(s2v001desc));
    fs.symlinkSync(s2version001, s2latest_path);
    done();
  });

  afterEach(function (done) {
    rimraf.sync(repository_path)
    done();
  });

  describe('#create', function () {

    var rext = new Rext(repository_path);

    it('creates a new version of document in the repository', function (done) {
      rext.create({
        name: s1v003desc_path
      , version: s1version003
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        if (err) done(err);

        var new_doc = fs.readFileSync(s1v003desc_path).toString('base64');
        new_doc.should.equal(s1v003desc_str.toString('base64'));

        done();
      });
    });

    it('creates the first document version in the repository', function (done) {
      rext.create({
        name: s1v003desc_path
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        if (err) done(err);

        var new_doc = fs.readFileSync(s1v003desc_path).toString('base64');
        new_doc.should.equal(s1v003desc_str.toString('base64'));

        done();
      });
     done();
    });

    it('returns an error if document version already exists', function (done) {
      rext.create({
        name: s1v001desc_path
      , version: s1version001
      , data: new Buffer(s1v001desc_str)
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('returns an error if document name is not valid', function (done) {
      rext.create({
        name: '?*strangeservice*'
      , version: s1version003
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('throws an error if document name is not passed', function (done) {
      should.throws(
        rext.create({
          version: s1version003
        , data: new Buffer(s1v003desc_str)
        }
        , function (err) {
            if (err) done(err);
          }
        )
      );

      done();
    });

    it('throws an error if document version is not passed', function (done) {
      should.throws(
        rext.create({
          name: service1
        , data: new Buffer(s1v003desc_str)
        }
        , function (err) {
            if (err) done(err);
          }
        )
      );

      done();
    });

    it('throws an error if document data is not passed', function (done) {
      should.throws(
        rext.create({
          name: service1
        , version: s1version003
        }
        , function (err) {
            if (err) done(err);
          }
        )
      );

      done();
    });

  });

  describe('#list', function () {

    var rext = new Rext(repository_path);

    it('lists all document names if undefined document name is passed', function (done) {
      rext.list(undefined, function (err, data) {
        if (err) done(err);

        data.should.should.have.lengthOf(2);
        data.should.contain(service1);
        data.should.contain(service2);

        done();
      });
    });

    it('lists all document names if nothing but callback is passed', function (done) {
      rext.list(function (err, data) {
        if (err) done(err);

        data.should.should.have.lengthOf(2);
        data.should.contain(service1);
        data.should.contain(service2);

        done();
      });
    });

    it('lists all version strings of a document, but \'last\', if document name is passed', function (done) {
      rext.list(service1, function (err, data) {
        if (err) done(err);

        data.should.should.have.lengthOf(2);
        data.should.contain(s1version001);
        data.should.contain(s1version002);

        done();
      });
    });

    it('returns an empty list if a not-existing document name is passed', function (done) {
      rext.list('false_service', function (err, data) {
        data.should.be.an.instanceof(Array);
        data.should.have.lengthOf(0);

        done();
      });
    });

  });

  describe('#destroy', function () {

    var rext = new Rext(repository_path);

    it('destroys a specific document version', function (done) {
      rext.destroy({
        name: service1
      , version: s1version002
      }, function (err) {
        if (err) done(err);

        should.be.true(path.existsSync(s1v001desc_path));
        should.not.be.true(path.existsSync(s1v002desc_path));

        done();
      })
    });

    it('destroys a document and all its versions', function (done) {
      rext.destroy({
        name: service1
      }, function (err) {
        if (err) done(err);

        should.be.true(path.existsSync(service2_path));
        should.not.be.true(path.existsSync(service1_path));

        done();
      })
    });

    it('returns an error if not-existing document name is passed', function (done) {
      rext.destroy({
        name: 'false_service'
      , version: s1version002
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('returns an error if not-existing document version is passed', function (done) {
      rext.destroy({
        name: service1
      , version: '1.0.3'
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

  });

  describe('#retrieve', function () {

    var rext = new Rext(repository_path);

    it('retrieves specific version of a document', function (done) {
      rext.retrieve({
        name: service1
      , version: s1version001
      }, function (err, data) {
        if (err) done(err);

        var doc = data.toString('base64');
        doc.should.equal(s1v001desc_str.toString('base64'));

        done();
      });
    });

    it('retrieves latest version of a document if version is not passed', function (done) {
      rext.retrieve({
        name: service1
      }, function (err, data) {
        if (err) done(err);

        var doc = data.toString('base64');
        doc.should.equal(s1latest_path.toString('base64'));

        done();
      });
    });

    it('returns an error if not-existing document name is passed', function (done) {
      rext.retrieve({
        name: 'false_service'
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
      should.throws(
        rext.retrieve({
          version: s1version002
        }
        , function (err) {
            if (err) done(err);
          }
        )
      );

      done();
    });

  });

  describe('#update', function () {

    var rext = new Rext(repository_path);

    it('updates a specific version of a document', function (done) {
      rext.update({
        name: s1v001desc_path
      , version: s1version001
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        if (err) done(err);

        var updated = fs.readFileSync(s1v001desc_path).toString('base64');
        updated.should.equal(s1v003desc_str.toString('base64'));

        var unchanged = fs.readFileSync(s1v002desc_path).toString('base64');
        unchanged.should.equal(s1v002desc_str.toString('base64'));

        done();
      });
    });

    it('updates the last version of a document if version is not passed', function (done) {
      rext.update({
        name: s1v001desc_path
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        if (err) done(err);

        var updated = fs.readFileSync(s1latest_path).toString('base64');
        updated.should.equal(s1v002desc_str.toString('base64'));

        var unchanged = fs.readFileSync(s1v001desc_path).toString('base64');
        unchanged.should.equal(s1v002desc_str.toString('base64'));

        done();
      });
    });

    it('returns an error if not-existing document name is passed', function (done) {
      rext.update({
        name: 'false-service'
      , version: s1version001
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('returns an error if not-existing document version is passed', function (done) {
      rext.update({
        name: service1
      , version: '1.0.6'
      , data: new Buffer(s1v003desc_str)
      }, function (err) {
        err.should.be.an.instanceof(Error);

        done();
      });
    });

    it('throws an error if document name is not passed', function (done) {
      should.throws(
        rext.update({
          version: s1version002
        , data: new Buffer(s1v003desc_str)
        }
        , function (err) {
            if (err) done(err);
          }
        )
      );

      done();
    });

    it('throws an error if document data is not passed', function (done) {
      should.throws(
        rext.update({
          name: service1
        , version: s1version002
        }
        , function (err) {
            if (err) done(err);
          }
        )
      );

      done();
    });

  });
});