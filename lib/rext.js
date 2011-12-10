
/*!
 * rext
 * Copyright (c) 2011 Grapily <dev@grapily.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * Create a rext repository in 'path' path
 *
 * @param {String} path path
 * @return {Function} rext
 */
var Rext = module.exports = function (path) {
  this.path = path;
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
 * Create 'option.name' document.
 *
 * @param {Object} options
 * @param {String} options.name name of document
 * @param {String} [options.version] version of document
 * @param {Object} options.data document data to create
 * @param {Function} callback function (err)
 * @api public
 */

Rext.prototype.create = function (options, callback) {

};

/**
 * Return all documents matching the expression
 *
 * @param {String} [expression] document name
 * @param {Function} callback function (err, data)
 * @api public
 */

Rext.prototype.list = function (options, callback) {

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
 * @param {String} [options.version]='last' version to retrieve
 * @param {Function} callback function (err, data)
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
 * @param {String} [options.version]='last' version to update
 * @param {Object} options.data document data to create
 * @param {Function} callback function (err)
 * @return {Boolean}
 * @api public
 */

Rext.prototype.update = function (options, callback) {

};