
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
    , s1v001desc_updated = {
        'service': service1
      , 'version': '0.0.1'
      , 'description': 'Service1 API version 1 updated'
      , 'protocol': 'http'
      , 'url': 'api.service1.com/1'
      }
    , s1version002 = '0.0.2'
    , s1v002desc = {
        'service': service1
      , 'version': s1version002
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , s1version003 = '0.0.3'
    , s1v003desc = {
        'service': service1
      , 'version': s1version003
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , service1_path = path.join(repository_path, service1);
    , s1version001_path = path.join(service1_path, s1version001);
    , s1version002_path = path.join(service1_path, s1version002);
    , s1version003_path = path.join(service1_path, s1version003);
    , s1v001desc_path = path.join(s1version001_path, filename);
    , s1v002desc_path = path.join(s1version002_path, filename);
    , s1v003desc_path = path.join(s1version003_path, filename);
    , s1latest_path = path.join(service1_path, latest_dir);
    , service2 = 'service2'
    , s2version001 = '0.0.1'
    , s2v001desc = {
        'service': service2
      , 'version': s2version001
      , 'description': 'Service2 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service2.com/1'
      }
    , service2_path = path.join(repository_path, service2);
    , s2version001_path = path.join(service2_path, s2version001);
    , s2v001desc_path = path.join(s2version001_path, filename);
    , s2latest_path = path.join(service2_path, latest_dir);
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

     done();
    });

    it('creates the first document version in the repository', function (done) {

     done();
    });

    it('throws an error if document name is not passed', function (done) {

     done();
    });

    it('throws an error if document version is not passed', function (done) {

     done();
    });

    it('throws an error if document data is not passed', function (done) {

     done();
    });

  });

  describe('#list', function () {

    it('lists all document names if no version is passed', function (done) {

      done();
    });

    it('lists all version string of a document if version is passed', function (done) {

      done();
    });

    it('returns an empty list if a not-existing document name is passed')

  });

  describe('#destroy', function () {

    it('destroys a specific document version', function (done) {

      done();
    });

    it('destroys a document and all its versions', function (done) {

      done();
    });

    it('returns an error if not-existing document name is passed', function (done) {

      done();
    });

  });

  describe('#retrieve', function () {

    it('retrieves specific version of a document', function (done) {

      done();
    });

    it('retrieves latest version of a document if version is not passed', function (done) {

      done();
    });

    it('returns an error if not-existing document name is passed', function (done) {

      done();
    });

  });

  describe('#update', function () {

    it('updates a specific version of a document', function (done) {

      done();
    });

    it('updates the last version of a document if version is not passed', function (done) {

      done();
    });

    it('returns an error if not-existing document name is passed', function (done) {

      done();
    });

    it('returns an error if not-existing document version is passed', function (done) {

      done();
    });

    it('throws an error if document name is not passed', function (done) {

      done();
    });

    it('throws an error if document data is not passed', function (done) {

      done();
    });

  });

});