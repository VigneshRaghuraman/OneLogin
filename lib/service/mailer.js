var rpcInstance = require('../config/service').mailer;
var RPC         = require('common-utils').RPC;

var external = {};

external.sendMail = function (req, callback) {
    RPC.eventEmitter(rpcInstance, 'sendMail', req, function (err, result) {
        return callback(err, result);
    });
};

module.exports = external;