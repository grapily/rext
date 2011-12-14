
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
    throw new Error('Repository required.');
    return;
  }

  this.path = path.normalize(repository);

  if (!path.existsSync(this.path)) {
    throw new Error('Can\'t locate repository.');
    return;
  };
};

/**
 * Library version.
 */

Rext.version = '0.0.5';

/**
 * Costants
 */

Rext.FILENAME = 'doc.rext';
Rext.LATEST_DIR = 'latest';
Rext.VERSION_EXP = /^\d\d?\.\d\d?\.\d\d?$|^latest$/;
Rext.VERSION_PATH_EXP = /\/(\d\d?\.\d\d?\.\d\d?)\/?$/;
Rext.errors = {
    BAD_ARGUMENTS: 'Bad arguments.'
  , DOCUMENT_NOT_EXIST: 'Requested document doesn\'t exist.'
  , VERSION_NOT_EXIST: 'Requested version doesn\'t exist.'
};

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
 * according to Rext.VERSION_EXP.
 *
 * @param {String} version string
 * @return {Boolean}
 * @api private
 */

function isVersionWellFormed (version) {
  return Rext.VERSION_EXP.test(version);
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

Rext.prototype._latest = function (name, callback) {
    var latestPath = path.join(this.path, name, Rext.LATEST_DIR);

    fs.realpath(latestPath, function (err, realPath) {
      callback(err, (realPath.match(Rext.VERSION_PATH_EXP) || [])[1]);
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

Rext.prototype._createDoc = function (options, callback) {
  var options = options
    , name = options.name
    , docPath = path.join(this.path, name)
    , that = this
    ;

  fs.mkdir(docPath, function (err) {
    if (err) {
      callback(err);
      return;
    }
    that._createVersion(options, callback);
  });
};

/**
 * Create 'options.version' dir and 'Rext.FILENAME' into it.
 * Create 'Rext.LATEST_DIR' symlink.
 *
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} options.version version of document
 * @param {String} options.data document data to create
 * @param {Function} callback function (err)
 * @api private
 */

Rext.prototype._createVersion = function (options, callback) {
  var options = options
    , name =  options.name
    , version = options.version
    , data = options.data
    , versionPath = path.join(this.path, name, version)
    , latestPath = path.join(this.path, name, Rext.LATEST_DIR)
    , filePath = path.join(this.path, name, version, Rext.FILENAME)
    , that = this
    ;

  fs.mkdir(versionPath, function(err) {
    if (err) {
      callback(err);
      return;
    }
    fs.symlink(version, latestPath, function (err) {
      if (err) {
        callback(err);
        return;
      }

      data
        .on('err', function (err) {
          callback(err);
        })
        .on('end', function () {
          callback();
        });
      
      data.pipe(fs.createWriteStream(filePath));  
      data.resume();
    })
  })
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

Rext.prototype._checkVersion = function (options, callback) {
  var options = options
    , name = options.name
    , version = options.version
    , that = this
    ;

  that._latest(name, function(err, latestVersion) {
    if (err) {
      callback(err);
      return;
    }

    var diff = compare(version, latestVersion)
      , latestPath = path.join(that.path, name, Rext.LATEST_DIR)
      ;

    if ( diff === 0) {
      callback (new Error('Please use \'update\''));
      return;
    }
    if ( diff < 0) {
      callback (new Error('Version must be greater than ' + latestVersion));
      return;
    }
    fs.unlink(latestPath, function(err) {
      if (err) {
        callback(err);
        return;
      }
      that._createVersion(options, callback);
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
  if (!options || typeof options === 'function') {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  if (!options.name || !options.version || !options.data) {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  var options = options
    , name = options.name
    , version = options.version
    , docPath = path.join(this.path, name)
    , that = this
    ;

  if (!isVersionWellFormed(version)) {
    callback(new Error('Bad version string'));
    return;
  }

  path.exists(docPath, function (exists) {
    if (exists) {
      that._checkVersion(options, callback);
      return;
    }

    that._createDoc(options, callback);
  })
};

/**
 * Return all documents names.
 * If a valid 'name' name is given, return
 * all version strings of that document.
 *
 * @param {String} [name] document name
 * @param {Function} callback function (err, data{Array})
 * @api public
 */

Rext.prototype.list = function (name, callback) {
  if (typeof name === 'function') {
    callback = name;
    name = '';
  };

  var docPath = path.join(this.path, name)
    ;

  path.exists(docPath, function(exists) {
    if (!exists) {
      callback(new Error(Rext.errors.DOCUMENT_NOT_EXIST));
      return;
    }

    fs.readdir(docPath, function (err, files) {
      if (files && files[files.length - 1] === Rext.LATEST_DIR) {
        files = files.slice(0, files.length - 1);
      }

      callback(err, files);
    });
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
  if (!options || typeof options === 'function') {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  if (!options.name) {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  var docPath = path.join(this.path, options.name);

  path.exists(docPath, function (exists) {
    if (! exists) {
      callback(new Error(Rext.errors.DOCUMENT_NOT_EXIST));
      return;
    }

    rimraf(docPath, callback);
  });
};

/**
 * Retrieve 'options.version' of 'options.name' document.
 * 'option.version' default to 'last'.
 *
 * @param {Object} options options
 * @param {String} options.name name of document
 * @param {String} [options.version='last'] version to retrieve
 * @param {Function} callback function ({Error}, {Stream})
 * @api public
 */

Rext.prototype.retrieve = function (options, callback) {
  if (!options || typeof options === 'function') {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  if (!options.name) {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  var options = options
    , name = options.name
    , version = options.version || Rext.LATEST_DIR
    , docPath = path.join(this.path, name)
    , versionPath = path.join(docPath, version)
    , filePath = path.join(versionPath, Rext.FILENAME)
    ;

  if (!isVersionWellFormed(version)) {
    callback(new Error('Bad version string'));
    return;
  }

  path.exists(docPath, function (exists) {
    if (! exists) {
      callback(new Error(Rext.errors.DOCUMENT_NOT_EXIST));
      return;
    }

    path.exists(versionPath, function (exists) {
      if (! exists) {
        callback(new Error(Rext.errors.VERSION_NOT_EXIST));
        return;
      }
      callback(null, fs.createReadStream(filePath));
    })
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
  if (!options || typeof options === 'function') {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  if (!options.name || !options.data) {
    throw new Error(Rext.errors.BAD_ARGUMENTS);
  }

  var options = options
    , name = options.name
    , data = options.data
    , docPath = path.join(this.path, name)
    , that = this
    ;

  path.exists(docPath, function (exists) {
    if (! exists) {
      callback(new Error(Rext.errors.DOCUMENT_NOT_EXIST));
      return;
    }

    that._latest(name, function (err, version) {
      if (err) {
        callback(err);
        return;
      }

      var filePath = path.join(docPath, version, Rext.FILENAME);

      fs.writeFile(filePath, data, callback);
    });
  });
};
