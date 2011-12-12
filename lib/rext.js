
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
  , rimraf = require('rimraf')
  ;

/**
 * Create a rext repository in 'path' path
 *
 * @param {String} repository path of repository
 * @return {Function} rext
 */
var Rext = module.exports = function (repository) {
  if (!repository) {
    throw new Error('Repository needed.');
    return;
  }

  this.path = path.normalize(repository);

  if (!path.existsSync(this.path)) {
    throw new Error('Can\'t find repository.');
    return;
  };
};

/**
 * Library version.
 */

Rext.version = '0.0.3';

/**
 * Costants
 */

Rext.FILENAME = 'doc.rext';
Rext.LATESTDIR = 'latest';

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

  return (+versionA[0] - +versionB[0]) * 10000 +
         (+versionA[1] - +versionB[1]) * 100 +
         (+versionA[2] - +versionB[2]);
}

/**
 * Test if 'path' exists.
 *
 * @param {String} testingPath
 * @param {String} errorMes
 * @param {Function} callback function (err{Error})
 * @api private
 */

function testPath (testingPath, errorMes, callback) {
    var err = undefined;

    path.exists(testingPath, function (exists) {
      if (! exists) err = new Error(errorMes);

      callback(err);
    });
}

/**
 * Return the latest version string of a document.
 *
 * @param {String} name
 * @param {Function} callback function (err{Error}, version{String})
 * @api private
 */

Rext.prototype.latest = function (name, callback) {
    var latestPath = path.join(this.path, name, Rext.LATESTDIR)
      , regex = /\/(\d\d?\.\d\d?\.\d\d?)\/?$/
      , matching
      , version
      ;

    fs.realpath(latestPath, function (err, realPath) {
      matching = realPath.match(regex) || [];
      version = matching[1]

      callback(err, version);
    });
}

/**
 * Update latest symbolic link to the version immedialty
 * older than latest version.
 *
 * @param {String} name
 * @param {String} latestVer
 * @param {Function} callback function (err{Error})
 * @api private
 */

Rext.prototype.updateLatest = function (name, latestVer, callback) {
  var that = this;

  async.waterfall([
    function (next) {
      that.list(name, next);
    },
    function (versions, next) {
      olderLatest(name, versions, latestVer, next);
    },
    function (olderLatest, next) {
      var latestPath = path.join(this.path, name, Rext.LATESTDIR);

      fs.unlink(latestPath, function (err) {
        fs.symlink(olderLatest, latestPath, callback);
      });
    }
  ], function (err) {
    callback(err);
  });
}

/**
 * Return the version string immedialty older than the latest.
 *
 * @param {String} name
 * @param {Array} versions of the 'name' document
 * @param {String} latestVer
 * @param {Function} callback function (err{Error}, version{String})
 * @api private
 */

function olderLatest (name, versions, latestVer, callback) {
  var latest = '0.0.0';

  versions.forEach(function (version) {
    if (compare(version, latest) > 0 && compare(version, latestVer) < 0) {
      latest = version;
    }
  });

  callback(null, latest);
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
  if (!doc) { throw new Error ('Bad argument'); }

  if (typeof doc === 'function') {
    callback = doc;
    doc = '';
  };

  fs.readdir(path.join(this.path, doc), function (err, files) {
    if (files && files[files.length - 1] === Rext.LATESTDIR)
      files = files.slice(0, files.length - 1);

    callback(err, files);
  });
};

/**
 * Destroy 'options.name' document.
 *
 * @param {Object} options options
 * @param {String} options.name
 * @param {Function} callback function (err{Error})
 * @api public
 */

Rext.prototype.destroy = function (options, callback) {
  var name = options.name
    , docPath = path.join(this.path, name)
    , nameThrowMes = 'Update error: document \'name\' is required.'
    , nameErrorMes = 'Update error: \'' + name + '\' is not an existing document.'
    , that = this
    ;

  if (! name) throw new Error(nameThrowMes);

  async.waterfall([
    function (next) {
      testPath(docPath, nameErrorMes, next);
    }
  ], function(err) {
    if (err) {
        callback(err);
        return;
    }

    rimraf(docPath, callback)
  });
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
  var name = options.name
    , version = options.version || Rext.LATESTDIR
    , docPath = path.join(this.path, name)
    , versionPath = path.join(docPath, version)
    , filePath = path.join(versionPath, Rext.FILENAME)
    , nameThrowMes = 'Update error: document \'name\' is required.'
    , nameErrorMes = 'Update error: \'' + name + '\' is not an existing document.'
    , verErrorMes = 'Update error: \'' + version + '\' is not an existing document version.'
    ;

  if (! name) throw new Error(nameThrowMes);

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

    fs.readFile(filePath, callback);
  });
};

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
    , version = options.version || Rext.LATESTDIR
    , data = options.data
    , docPath = path.join(this.path, name)
    , versionPath = path.join(docPath, version)
    , filePath = path.join(versionPath, Rext.FILENAME)
    , nameThrowMes = 'Update error: document \'name\' is required.'
    , dataThrowMes = 'Update error: document \'data\' is required.'
    , nameErrorMes = 'Update error: \'' + name + '\' is not an existing document.'
    , verErrorMes = 'Update error: \'' + version + '\' is not an existing document version.'
    ;

  if (! name) throw new Error(nameThrowMes);
  if (! data) throw new Error(dataThrowMes);

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