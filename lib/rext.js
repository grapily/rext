
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
  ;

/**
 * Create a rext repository in 'path' path
 *
 * @param {String} repository path of repository
 * @return {Function} rext
 */
var Rext = module.exports = function (repository) {
  if (!repository) { 
    throw new Error('Repository needed');
    return;
  }

  this.path = path.normalize(repository);

  if (!path.existsSync(this.path) || 
      !fs.readdirSync(this.path).length) {
    throw new Error('Can\'t find repository or directory not empty');
    return;
  };
};

/**
 * Library version.
 */

Rext.version = '0.0.3';

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
  var module_path = path.join(this.path, options.name);
  
  fs.mkdir(module_path, function (err) {
    if (err) {
      callback(err);
      return;
    } 
    createVersion(options, callback);
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
    , latest_path = path.join(this.path, options.name, this.LATESTDIR);
  
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
      createFile(options, callback);
    })
  })
};

Rext.prototype.createFile = function (options, callback) {
  var doc_path = path.join(this.path, options.name, options.version, this.FILENAME);
  
  fs.writeFile(doc_path, options.data, callback);
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
  this.latest(options.name, function(err, latestversion) {
    if (err) {
      callback(err);
      return;
    }
    var diff = compare(options.version, latestversion)
      , latest_path = path.join(this.path, options.name, this.LATESTDIR);
    if ( diff === 0) {
      callback (new Error('Please use update'));
      return;
    }
    if ( diff < 0) {
      callback (new Error('You can create a version newer than '+latestversion));
      return;
    }
    fs.unlink(latest_path, function(err) {
      if (err) {
        callback(err);
        return;
      }
      createVersion(options, callback);
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
  var options = options;
  
  if (!options || typeof options === 'function') {
    throw new Error('Bad argument');
  } 
  
  if (!options.name || !options.version || !options.data) {
    throw new Error('Bad argument');
  }
  var module_path = path.join(this.path, options.name);
  
  path.exists(module_path, function (exists) {
    if (exist) {
      checkVersion(options, callback);
      return;
    }
    createDoc(options, callback);  
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
  if (!doc) { throw new Error ('Bad argument') };

  if (typeof doc === 'function') { callback = doc, doc = '' };

  fs.readdir(path.join(this.path, doc), callback);
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

};
