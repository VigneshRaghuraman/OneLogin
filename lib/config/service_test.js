var DB        = require('../config/couchbase_config').user;
var appConfig = require('../config/app');

module.exports = function (callBack) {
    var error = {service: "couchbase", status: "stop", connectionSpec: appConfig.database.couchbase.user};
    DB.upsert("PING", {}, function (err, result) {
        if (err)
            return callBack(error);
        else {
            DB.remove("PING", function (err, result) {
                if (err)
                    return callBack(error);
                else
                    return callBack(null, {service: "couchbase", status: "running"});
            })
        }
    });
};