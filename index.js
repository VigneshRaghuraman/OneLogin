/**
 * Created by jaya on 19/08/15.
 */

var Hapi      = require('hapi');
var HmSwagger = require('hm-hapi-swagger');
var Hmauth = require('hmauth');

var routes    = require('./lib/route/route');
var appConfig = require('./lib/config/app');
var cmsModel = require('./lib/model/user')
var server = new Hapi.Server({debug: {log: ['error'], request: ['error']}});
server.connection(appConfig.server);


/** Load Public Directory Files **/

// server.route({
//     method : 'GET',
//     path   : '/static/{param*}',
//     handler: {
//         directory: {
//             path: 'public'
//         }
//     }
// });

server.register({register: Hmauth}, function (err) {
    if (err) {
        server.log(['error'], 'hmauth plugin load error: ' + err)
    }
    else {
        server.auth.strategy('hmauth', 'hm-auth', {
            allowQueryToken     : true,              // optional, true by default
            allowMultipleHeaders: true,        // optional, true by default
            accessTokenName     : 'authorization',    // optional, 'access_token' by default
            validateFunc        : function (authToken, callback) {
                cmsModel.validateSession({payload: {authorization: authToken}}, function (err, authObj) {
                    if (!err) {
                        return callback(null, authObj);
                    } else {
                        return callback(err, false);
                    }
                });
            }
        });
    }
});


/** Load routes in routes Dir **/
var count = 0;
for (var route in routes) {
    server.route(routes[route]);
    count += Object.keys(routes[route]).length;
}

console.log("Total API count:" + count);

/** Register the Swagger Plugin **/
server.register({register: HmSwagger, options: appConfig.swaggerOptions}, function (err) {
    if (err) {
        log.info(err);
        process.exit(1);
    }
});

/** Start the Server Command **/
server.start(function (err, res) {
    if (!err) {
        console.log("Server (0.1.0) started at %s", server.info.uri);
    } else {
        console.log(err);
    }
});
