/**
 * Created by jaya on 23/09/15.
 */

var crl      = require('../lib/controller/user');
var loginReq = {
    // payload : {
    //     loginType : 'FB',
    //     device : {
    //         deviceId : 'tes',
    //         deviceToken : 'tes',
    //         mode : 'IOS'
    //     },
    //     facebook : {
    //         fbId: '987654321',
    //         fbToken: '1234567',
    //         mail: 'jaya14@gmail.com'
    //     },
    //     loginMode : 'USER'
    // }
    // payload: {
    //     "loginType": "GPLUS",
    //     "device": {
    //         "deviceId": "test",
    //         "deviceToken": "test",
    //         "mode": "IOS"
    //     },
    //     "gplus": {
    //         "gmail": "jaya12@gmail.com",
    //         "gPlusToken": "sfsd",
    //         "gPlusId" : "sfds"
    //     },
    //     "loginMode": "USER"
    // }
    payload: {
       "loginType": "MOBILE",
        "mobile" : {
           "number" : "9442896859"
        },
       "device": {
           "deviceId": "test2",
           "deviceToken": "test2",
           "mode": "IOS"
       },
       "mail": {
           "mail": "jaya8@gmail.com",
           "password" : "4321",
           "fbToken": "sfsd",
           "gPlusId" : "sfds"
       },
       "loginMode": "USER"
    }
};

var guestLoginReq = {
    payload: {
        device: {
            deviceId : '1234',
            mode : 'IOS'
        },
        name       : '',
        no         : '',
        wing       : '',
        locality   : '',
        city       : '',
        state      : '',
        country    : '',
        pinCode    : '',
        geoLocation: {
            lat : 40,
            lon : 70
        }
    }
}

var resetPasswdRequest = {
    params: {
        email: 'jaya8@gmail.com'
    }
}

var updateProfileReq = {
    auth : 'UTfXvMvdZYYGPWiQMeOfcqWuExDfra',
    payload: {
        "imageKey": "test12",
        "mbNo" : "1234"
    }
}

var getProfileReq = {
    params: {
        "id": "HB00007"
    }
}

var logoutreq = {
    auth : 'AWEKjtohZjYHarFjOgSfTXZcfNLqjT'
};

var getMultiUsersRequest = {
    auth : "UTfXvMvdZYYGPWiQMeOfcqWuExDfra",
    payload: {
        "ids": ["HB00007", "HB00007"]
    }
}

var validateSessionRequest = {
    payload : {
        authorization : "sfds"
    }
};

var changePass = {
    auth : "WVquQydhVQXLVVlcfWWfRqMtEXYtBP",
    payload : {
        oldPassword    : '1234zfafasd1',
        newPassword    : '4321',
        confirmPassword: '4321'
    }
}

var changeLoginMode = {
    auth : 'BOwktnSpZIumVKGTpfUSiNRxIRMRfv',
    payload :{
        loginMode : 'OWNER'
    }

}

crl.login(loginReq, function (err, res) {
    console.log(err, res);
});
