/**
 * Created by safi on 22/04/15 9:22 AM.
 */
var NodeRpc = require('node-redis-rpc');
var redis = require('redis');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
//var log = require('./lib/config/logger');

var appConfig = require('./lib/config/app');
var serviceTest = require('./lib/config/service_test');
console.log(appConfig.database.redis);
var rpcIns = new NodeRpc(appConfig.database.redis);

var client = redis.createClient(appConfig.database.redis.port, appConfig.database.redis.host, {});


var ctrlPath = appConfig.ctrlPath;

var controlers = {}, errObj = [];


fs.readdirSync(ctrlPath).forEach(function (file) {
    var ctrl = require(path.join(__dirname, path.join(ctrlPath, file)));
    for (var key in ctrl) {
        if (controlers[key]) {
            errObj.push({err: "This Method Already Exits", methodName: key, fileName: file});
        } else {
            if (typeof(ctrl[key]) === "function") {
                controlers[key] = ctrl[key];
            } else {
                errObj.push({
                    err: "Controller Not a " + typeof(ctrl[key]) + " . Its should be Function",
                    methodName: key,
                    fileName: file
                });
            }
        }
    }
});
/** Error handler **/
if (errObj.length != 0) {   // Checck Controller Method Name and all contoller have function
    console.error("************ RPC Channel Failed *******");
    console.error(errObj);
    throw (errObj);
}

var reqQueContainer = [];
var liveProcessCount = 0;
var liveProcessLimit = 50;

var channelBinder = function (key, method) {

    rpcIns.on(key, function (req, channel, cb) {
        //request load to Temp Obj
        if (liveProcessCount <= liveProcessLimit) {
            invokingMethod(method, req, cb);
        } else {
            reqQueContainer.push(
                {
                    method: method,
                    req: req,
                    cb: cb
                });
        }
    });
};

var invokingMethod = function (method, req, cb) {

    client.setnx(req.__backChannel, {}, function (err, res) {
        if (res === 1) {
            var newReq = _.clone(req);
            delete newReq.__backChannel;
            delete newReq.__type;
            liveProcessCount++;
            method(newReq, function (err, data) {
                cb(err, data);
                client.expire(req.__backChannel, 600000);
                liveProcessCount--;
                var newReq = reqQueContainer.shift();
                if (newReq)
                    invokingMethod(newReq.method, newReq.req, newReq.cb);
            });
        } else {
            var newReq = reqQueContainer.shift();
            if (newReq)
                invokingMethod(newReq.method, newReq.req, newReq.cb);
        }

    });
};


serviceTest(function (err, result) {
    if (err) {
        console.error("Please Check All Pre Service are Running");
        console.error(err);
       // throw(JSON.stringify(err));
    }

    /**  Load Controllers To RPC Channels **/
    for (var key in controlers) {
        channelBinder(key, controlers[key]);
    }

    channelBinder('ping', function (req, callback) {
        serviceTest(function (err, result) {
            if (err)
                return callback(err);
            else
                return callback(null, {status: 200, scope: "onelogin", msg: "I am Healthy :) "})
        });
    });

    console.log("************ RPC Channel Started *******");
    console.log("************ App Name : " + appConfig.name + " *******");
    console.log("************ App Mode : " + process.env.MODE + " *******");
    console.log("************ App Version : " + appConfig.version + " *******");
    console.log("************ Main Channel name: " + appConfig.database.redis.scope + " *******");

});

