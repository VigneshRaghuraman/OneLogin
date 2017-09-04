/**
 * Created by jaya on 19/08/15.
 */

/**
 * This class will set application configuration based on the environment
 * @type {*|exports}
 */
var commonUtilsApp = require('common-utils').APP;
var document       = {
    "stage"  : {
        name           : "onelogin",
        version        : "v0.0.1",
        ctrlPath       : 'lib/controller',
        emailVerifyLink: 'http://api.homebuzz.ga/user/verify/',
        esIndex        : 'homebuzz',
        database       : {
            "couchbase"  : {
                "common": commonUtilsApp.database.couchbase.common,
                "user"  : commonUtilsApp.database.couchbase.user
            },
            redis        : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'onelogin'
            },
            elasticsearch: commonUtilsApp.database.elasticsearch
        },
        services       : {
            mailer      : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'mailer'
            },
            messenger   : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'messenger'
            },
            "elk_logger": {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'elk_logger'
            }
        },
        "bunyan"       : {
            "env": "default"
        }
    },
    "dev"    : {
        name           : "onelogin",
        version        : "v0.0.1",
        ctrlPath       : 'lib/controller',
        emailVerifyLink: 'http://api.homebuzz.ga/user/verify/',
        esIndex        : 'homebuzz',
        database       : {
            "couchbase"  : {
                "common": commonUtilsApp.database.couchbase.common,
                "user"  : commonUtilsApp.database.couchbase.user
            },
            redis        : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'onelogin'
            },
            elasticsearch: commonUtilsApp.database.elasticsearch
        },
        services       : {
            mailer      : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'mailer'
            },
            messenger   : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'messenger'
            },
            "elk_logger": {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'elk_logger'
            }
        },
        "bunyan"       : {
            "env": "default"
        }
    },
    "default": {
        name           : "onelogin",
        version        : "v0.0.1",
        ctrlPath       : 'lib/controller',
        emailVerifyLink: 'http://localhost:5000/user/verify/',
        esIndex        : 'homebuzz',
        server         : {
            "host": "localhost",
            "port": 5000,
            routes: {
                cors    : true,
                validate: {options: {stripUnknown: true}}
            }
        },
        swaggerOptions : {
            'name'           : 'oneLogin',
            'title'          : 'oneLogin API services',
            basePath         : "http://localhost:5000",
            apiVersion       : 'V1.1.0',
            documentationPath: "/",
            username         : "onelogin",
            password         : "hm1234$"
        },
        database       : {
            "couchbase"  : {
                "common": commonUtilsApp.database.couchbase.common,
                "user"  : commonUtilsApp.database.couchbase.user
            },
            redis        : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'onelogin'
            },
            elasticsearch: commonUtilsApp.database.elasticsearch
        },
        services       : {
            mailer      : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'mailer'
            },
            messenger   : {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'messenger'
            },
            "elk_logger": {
                host : commonUtilsApp.database.redis.host,
                port : commonUtilsApp.database.redis.port,
                scope: 'elk_logger'
            }
        },
        "bunyan"       : {
            "env": "default"
        }
    }
};

var loadDocument = null;
var environment  = process.env.MODE;

if (environment == "stage") {
    loadDocument = document.stage;
} else if (environment == "dev") {
    loadDocument = document.dev;
} else {
    loadDocument = document.default;
}

module.exports = loadDocument;

