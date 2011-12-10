var undefined
  , fs = require('fs')
  , path = require('path')
  , rimraf = require('rimraf')
  , async = require('async')
  , Repository = require('../lib/rext.js')
  ;

describe('Resxt', function () {

  var repository_path = 'test/test-repository'
    , service1 = 'service1'
    , s1version001 = '0.0.1'
    , s1v001desc = {
        'service': 'service1'
      , 'version': '0.0.1'
      , 'description': 'Service1 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service1.com/1'
      }
    , s1v001desc_updated = {
        'service': 'service1'
      , 'version': '0.0.1'
      , 'description': 'Service1 API version 1 updated'
      , 'protocol': 'http'
      , 'url': 'api.service1.com/1'
      }
    , s1version002 = '0.0.2'
    , s1v002desc = {
        'service': 'service1'
      , 'version': '0.0.2'
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , s1v003desc = {
        'service': 'service1'
      , 'version': '0.0.3'
      , 'description': 'Service1 API version 1'
      , 'protocol': 'https'
      , 'url': 'api.service1.com/1'
      }
    , service1_path = repository_path + '/' + service1
    , s1version001_path = service1_path + '/' + s1version001
    , s1version002_path = service1_path + '/' + s1version002
    , s1v001desc_path = s1version001_path + '/' + 'descriptor.json'
    , s1v002desc_path = s1version002_path + '/' + 'descriptor.json'
    , s1latest_path = service1_path + '/latest'
    , service2 = 'service2'
    , s2version001 = '0.0.1'
    , s2v001desc = {
        'service': 'service2'
      , 'version': '0.0.1'
      , 'description': 'Service2 API version 1'
      , 'protocol': 'http'
      , 'url': 'api.service2.com/1'
      }
    , service2_path = repository_path + '/' + service2
    , s2version001_path = service2_path + '/' + s2version001
    , s2v001desc_path = s2version001_path + '/' + 'descriptor.json'
    , s2latest_path = service2_path + '/latest'
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

    it('update...', function () {

      done();
    });

  });

});