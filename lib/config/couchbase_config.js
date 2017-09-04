/**
 * Created by jaya on 24/08/15.
 */


/**
 * Couchbase Database Configuration
 * @type {exports}
 */
var couchbase = require('couchbase');

var appConfig = require('./app');

var commonCluster = new couchbase.Cluster(appConfig.database.couchbase.common.host + ":" + appConfig.database.couchbase.common.port);
var common        = commonCluster.openBucket(appConfig.database.couchbase.common.bucketName);

var userCluster = new couchbase.Cluster(appConfig.database.couchbase.user.host + ":" + appConfig.database.couchbase.user.port);
var user        = userCluster.openBucket(appConfig.database.couchbase.user.bucketName);

module.exports.user   = user;
module.exports.common = common;