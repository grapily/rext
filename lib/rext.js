
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
Rext.VERSIONEXP = /\d\d?\.\d\d?\.\d\d?/;
Rext.VERSIONPATHEXP = /\/(\d\d?\.\d\d?\.\d\d?)\/?$/;

/**
 * Compare 'versionA' to 'varsionB' and return a number:
 * _ >0 if 'versionA' > 'varsionB',
 * _ <0 if 'versionA' < 'varsionB'
 * _ =0 if 'versionA' = 'versionB'.
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
 * Test if 'version' string is well-formed
 * according to Rext.VERSIONEXP
 *
 * @param {String} version string
 * @return {Boolean}
 * @api private
 */

function isVersionWellFormed (version) {
  return Rext.VERSIONEXP.test(version);
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
    var latestPath = path.join(this.path, name, Rext.LATESTDIR);

    fs.realpath(latestPath, function (err, realPath) {
      callback(err, (realPath.match(Rext.VERSIONPATHEXP) || [])[1]);
    });
}

/**
 * Create a Document dir.
 *
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} options.version version of document
 * @param {String} options.data document data to create
 * @param {Function} callback function (err)
 * @api private
 */
 
Rext.prototype.createDoc = function (options, callback) {
  var docPath = path.join(this.path, options.name)
    , that = this
    ;

  fs.mkdir(docPath, function (err) {
    if (err) {
      callback(err);
      return;
    } 
    that.createVersion(options, callback);
  });
};

/**
 * Create 'options.version' and 'this.LATESTDIR' symlink.
 * 
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} options.version version of document
 * @param {String} options.data document data to create
 * @param {Function} callback function (err)
 * @api private
 */

Rext.prototype.createVersion = function (options, callback) {
  var version_path = path.join(this.path, options.name, options.version)
    , latest_path = path.join(this.path, options.name, Rext.LATESTDIR)
    , that = this
    ;
  
  fs.mkdir(version_path, function(err) {
    if (err) {
      callback(err);
      return;
    }
    fs.symlink(options.version, latest_path, function (err) {
      if (err) {
        callback(err);
        return;
      }
      that.createFile(options, callback);
    })
  })
};

Rext.prototype.createFile = function (options, callback) {
  var filePath = path.join(this.path, options.name, options.version, Rext.FILENAME);
  
  fs.writeFile(filePath, options.data, callback);
};

/**
 * Check if 'options.version' > latest.
 * Manage to create it or return and error.
 * 
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} options.version version of document
 * @param {String} options.data document data to create
 * @param {Function} callback function (err)
 * @api private
 */

Rext.prototype.checkVersion = function (options, callback) {
  var that = this; 
  that.latest(options.name, function(err, latestVersion) {
    if (err) {
      callback(err);
      return;
    }
    
    var diff = compare(options.version, latestVersion)
      , latestPath = path.join(that.path, options.name, Rext.LATESTDIR)
      ;
      
    if ( diff === 0) {
      callback (new Error('Please use update'));
      return;
    }
    if ( diff < 0) {
      callback (new Error('You can create a version newer than '+latestVersion));
      return;
    }
    fs.unlink(latestPath, function(err) {
      if (err) {
        callback(err);
        return;
      }
      that.createVersion(options, callback);
    })
  })
};

/**
 * Create 'option.name' document.
 *
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} options.version version of document
 * @param {String} options.data document data to create
 * @param {Function} callback function (err)
 * @api public
 */

Rext.prototype.create = function (options, callback) {
  var options = options
    , that = this
    ;
  
  if (!options || typeof options === 'function') {
    throw new Error('Bad argument');
  } 
  
  if (!options.name || !options.version || !options.data) {
    throw new Error('Bad argument');
  }
  
  var docPath = path.join(that.path, options.name);
  
  path.exists(docPath, function (exists) {
    if (exists) {
      that.checkVersion(options, callback);
      return;
    }

    that.createDoc(options, callback);  
  })
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
 * Update latest version of 'option.name' document.
 *
 * @param {Object} options
 * @param {String} options.name name of descriptor
 * @param {Buffer} options.data document data to create
 * @param {Function} callback function (err{Error})
 * @api public
 */

Rext.prototype.update = function (options, callback) {
  var name = options.name
    , data = options.data
    , docPath = path.join(this.path, name)
    , versionPath
    , filePath
    , nameThrowMes = 'Update error: document \'name\' is required.'
    , dataThrowMes = 'Update error: document \'data\' is required.'
    , nameErrorMes = 'Update error: \'' + name + '\' is not an existing document.'
    , that = this
    ;

  if (! name) throw new Error(nameThrowMes);
  if (! data) throw new Error(dataThrowMes);

  async.waterfall([
    function (next) {
      testPath(docPath, nameErrorMes, next);
    },
    function (next) {
      that.latest(name, next);
    },
    function (version, next) {
      versionPath = path.join(docPath, version);
      filePath = path.join(versionPath, Rext.FILENAME);
      next(null);
    }
  ], function(err) {
    if (err) {
        callback(err);
        return;
    }

    fs.writeFile(filePath, data, callback);
  });
};
