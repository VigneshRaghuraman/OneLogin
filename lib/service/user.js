/**
 * Created by jaya on 24/08/15.
 */

var joi = require('joi');

var UserDB = require('../config/couchbase_config').user;
var dbKeys = require('common-utils').KEY_PREFIX;

var couchBase            = require('common-utils').CB;
var RES_MSG              = require('common-utils').RES_MSG;
var CB_ERR               = require('common-utils').CB_ERR;
//var userServiceES        = require('./userES');
//var UserDB="requirement"
var user = {};

user.getAndTouchAuthDocument = function (authToken, callback) {
    couchBase.getAndTouch(UserDB, dbKeys.AUTH + authToken, 3600, function (err, result, others) {
        if (!err) {
            return callback(null, result);
        } else {
            if (err.code == CB_ERR.KEY_NOT_FOUND) {
                return callback();
            } else {
                return callback(RES_MSG.RES_INT_SERVER_ERR);
            }
        }
    });
};

user.createUserId = function (callback) {
    couchBase.counter(UserDB, dbKeys.USER, 1, {initial: 1}, function (err, result) {
        if (err) {
            return callback(RES_MSG.RES_INT_SERVER_ERR);
        } else {
            var id    = "HB";
            var resId = result.value;

            if (resId >= 10000) {
                id = id + resId.toString();
            }
            else if (resId >= 1000) {
                id = id + "0" + resId.toString();
            }
            else if (resId >= 100) {
                id = id + "00" + resId.toString();
            }
            else if (resId >= 10) {
                id = id + "000" + resId.toString();
            } else {
                id = id + "0000" + resId.toString();
            }
            return callback(null, id);
        }
    });
};

module.exports = user;