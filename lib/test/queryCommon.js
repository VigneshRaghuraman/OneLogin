/**
 * Created by hmspl on 30/8/16.
 */
var query = require("../service/common");
var co = require('../constant/query')
var UserDB = require("../config/couchbase_config").user;
console.log(UserDB._name)
query.query(co.SELECT , [UserDB._name] , function(err , res){
    console.log("err" ,err)
    console.log("res" ,res)
})