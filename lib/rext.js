
/*!
 * rext
 * Copyright (c) 2011 Grapily <dev@grapily.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , async = require('async')
  ;

/**
 * Create a rext repository in 'path' path
 *
 * @param {String} path path
 * @return {Function} rext
 */
var Rext = module.exports = function (repository) {
  this.path = repository;
};

/**
 * Library version.
 */

Rext.version = '0.0.3';

/**
 * Costants
 */
Rext.FILENAME = 'doc.rext';

/**
 * Compare 'versionA' to 'varsionB' and return a number:
 * _ >0 if 'versionA' is younger than 'varsionB',
 * _ <0 if 'versionA' is older than 'varsionB'
 * _ =0 if 'versionA' is the same version of 'versionB'.
 *
 * @param {String} versionA
 * @param {String} versionB
 * @return {Number}
 * @api private
 */

function compare (versionA, versionB) {
  versionA = (versionA || '0.0.1').split('.');
  versionB = (versionB || '0.0.0').split('.');

  return
    (+versionA[0] - +versionB[0]) * 10000 +
    (+versionA[1] - +versionB[1]) * 100 +
    (+versionA[2] - +versionB[2]);
}

/**
 * Create 'option.name' document.
 *
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} options.version version of document
 * @param {Buffer} options.data document data to create
 * @param {Function} callback function (err)
 * @api public
 */

Rext.prototype.create = function (options, callback) {

};

/**
 * Return all documents names.
 * If a valid 'doc' name is given, return
 * all version strings of that document.
 *
 * @param {String} [doc] document name
 * @param {Function} callback function (err, data{Array})
 * @api public
 */

Rext.prototype.list = function (doc, callback) {

};

/**
 * Destroy 'option.version' of 'option.name' document.
 * If version is not passed, destroy all verions of this document.
 *
 * @param {Object} options options
 * @param {String} options.name name of document
 * @param {String} [options.version] version of document
 * @param {Function} callback function (err)
 * @api public
 */

Rext.prototype.destroy = function (options, callback) {

};


/**
 * Retrieve 'options.version' of 'options.name' document.
 * 'option.version' default to 'last'.
 *
 * @param {Object} options options
 * @param {String} options.name name of document
 * @param {String} [options.version='last'] version to retrieve
 * @param {Function} callback function (err, data{Buffer})
 * @api public
 */

Rext.prototype.retrieve = function (options, callback) {

};

/**
 * Test if 'path' exists.
 * To use in an asynchronous waterfalled way.
 *
 * @param {String} testingPath
 * @param {String} errorMes
 * @param {Function} next function (err{Error})
 * @api private
 */

function testPath (testingPath, errorMes, next) {
    var err = undefined;

    path.exists(testingPath, function (exists) {
      if (! exists) err = new Error(errorMes);

      next(err);
    });
}

/**
 * Update 'option.version' of 'option.name' document.
 * 'option.version' default to 'last'.
 *
 * @param {Object} options
 * @param {String} options.name name of descriptor
 * @param {String} [options.version='last'] version to update
 * @param {Buffer} options.data document data to create
 * @param {Function} callback function (err)
 * @return {Boolean}
 * @api public
 */

Rext.prototype.update = function (options, callback) {
  var name = options.name
    , version = options.version || 'latest'
    , data = options.data
    , validName
    , validVersion
    , docPath = path.join(this.path, name)
    , versionPath = path.join(docPath, version)
    , filePath = path.join(versionPath, Rext.FILENAME)
    , nameThrowMes = 'Update error: document \'name\' is required.'
    , verThrowMes = 'Update error: document \'data\' is required.'
    , nameErrorMes = 'Update error: \'' + name + '\' is not an existing document.'
    , verErrorMes = 'Update error: \'' + version + '\' is not an existing document version.'
    ;

  if (! name) throw new Error(nameThrowMes);
  if (! data) throw new Error(verThrowMes);

  async.waterfall([
    function (next) {
        testPath(docPath, nameErrorMes, next);
    },
    function (next) {
        testPath(versionPath, verErrorMes, next);
    }
  ], function(err) {
    if (err) {
        callback(err);
        return;
    }

    fs.writeFile(filePath, data, callback);
  });
};
