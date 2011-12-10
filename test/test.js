
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

    it('create...', function (done) {

     done();
    });

  });

  describe('#list', function () {

    it('list...', function (done) {

      done();
    });

  });

  describe('#destroy', function () {

    it('destroy...', function (done) {

      done();
    });

  });

  describe('#retrieve', function () {

    it('retrieve...', function (done) {

      done();
    });
  });

  describe('#update', function () {

    it('update...', function (done) {

      done();
    });

  });

});