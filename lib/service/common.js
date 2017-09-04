/**
 * Created by hmspl on 30/8/16.
 */


var event       = {};
var joi         = require('joi');
var DB          = require('../config/couchbase_config').user;
var commonUtils = require('common-utils');
var cb          = require('couchbase');
var N1qlQuery   = cb.N1qlQuery;
var RES_MSG     = commonUtils.RES_MSG;
/**Execute Query
 *
 * @param query
 * @param callback
 */
event.query     = function (query, values, callback) {
    var finalQuery = N1qlQuery.fromString(query);
    if (values instanceof Function) {
        callback = arguments[1];
        values   = [];
    }
    DB.query(finalQuery, values, function (err, res) {
        if (!err) {
            return callback(null, res);
        } else {
            return callback(RES_MSG.RES_INT_SERVER_ERR);
        }
    })
};

event.queryBuilder = function queryBuilder(queryString, valueObject, callback) {
    var regex        = /\$\w+/g;
    var resultArray  = [];
    var resultString = queryString.replace(regex, function (matchString) {
        var matchValue      = matchString.substring(1);
        var valueFromObject = valueObject[matchValue];
        if (valueFromObject == null || valueFromObject == 0) {
            resultArray.push(valueFromObject);
            return "?";
        } else {
            return valueFromObject;
        }
    });
    if (resultString.match(regex)) {
        console.log(resultString);
        return callback(null);
    } else {
        return callback(resultString, resultArray)
    }
};

module.exports = event;


//var UserDB = require("../config/couchbase_config").user
//var cb = require('couchbase');
//var N1qlQuery = cb.N1qlQuery;
//var event = {};
//var RES_MSG       = require('common-utils').RES_MSG;
//event.query = function (query,placeValue ,callback) {
//    console.log(query, placeValue[0])
//    var finalQuery = N1qlQuery.fromString(query);
//    UserDB.query(finalQuery, placeValue ,function (err, res) {
//        if (!err) {
//            return callback(null, res);
//        } else {
//            return callback(RES_MSG.RES_INT_SERVER_ERR);
//        }
//
//    })
//};
//
//module.exports = event;