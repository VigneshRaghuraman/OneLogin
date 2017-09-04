/**
 * Created by jaya on 12/09/15.
 */

var joi    = require('joi');
var common = require('./common');

var user = {};

var name = joi.object({
    firstName: joi.string().description("First name of the user"),
    lastName : joi.string().description("Last name of the user")
}).meta({className: 'Name'});

var facebook = joi.object({
    fbId   : joi.string().required(),
    fbToken: joi.string().required(),
    mail   : joi.string()
}).meta({className: 'Facebook'});


var gplus = joi.object({
    gmail     : joi.string().required(),
    gPlusToken: joi.string().required(),
    gPlusId   : joi.string().required()
}).meta({className: 'Gplus'});

var mail = joi.object({
    mail    : joi.string().required(),
    password: joi.string().required(),
    signUp  : joi.boolean().default(true)
}).meta({className: 'Mail'});

var mobile = joi.object({
    number : joi.string().required()
}).meta({className: 'Mobile'});

var twitter = joi.object({
    mail    : joi.string(),
    twitterId : joi.string().required(),
    twitterToken : joi.string().required()
}).meta({className: 'Twitter'});

var linkedIn = joi.object({
    mail    : joi.string(),
    linkedInId : joi.string().required(),
    linkedInToken : joi.string().required()
}).meta({className: 'LinkedIn'});


var mailWithoutPassword = joi.object({
    mail: joi.string().required()
}).meta({className: 'Mail'});

var status = joi.object({
    code : joi.number(),
    message : joi.string()
})

var device = joi.object({
    mode       : joi.string().valid(["IOS", "WEB", "ANDROID"]).default("IOS").required(),
    deviceId   : joi.string(),
    deviceToken: joi.string(),
    model      : joi.string(),
    version    : joi.string(),
    OS         : joi.string()
}).meta({className: 'Device'});

var userRequest = joi.object({
    name    : name,
    facebook: facebook,
    gplus   : gplus,
    mail    : mail,
    mobile : mobile,
    twitter : twitter,
    linkedIn : linkedIn,
    gender  : joi.string().valid(["MALE", "FEMALE"]),
    dob     : joi.date()
}).meta({className: 'User'});

var userObj = joi.object({
    name    : name,
    facebook: facebook,
    gplus   : gplus,
    mail    : mailWithoutPassword,
    gender  : joi.string().valid(["MALE", "FEMALE"]),
    dob     : joi.date()
}).meta({className: 'User'});

var userDetail = joi.object({
    id             : joi.string().description("Unique user id").required(),
    createdDate    : joi.date(),
    updatedDate    : joi.date(),
    regEmail       : joi.string(),
    profession     : joi.string(),
    description    : joi.string(),
    name           : name,
    gender         : joi.string().valid(["MALE", "FEMALE"]),
    dob            : joi.date(),
    mbNo           : joi.string(),
    imageURL       : joi.string(),
    imageKey       : joi.string().description("Image Key"),
    location       : common.location,
    status         : joi.string().valid(["INACTIVE", "ACTIVATED", "VERIFIED"]),
    timeZone       : joi.string().description("Time zone of the user").default("+05:30"),
    buzzCount      : joi.number(),
    pushNotiService: joi.boolean().default(false).description('Push Notification Service is ON or OFF'),
    locationService: joi.boolean().default(false).description('Location Service is ON or OFF'),
    historyLimit   : joi.number(),
    payoutMethod   : joi.string(),
    setupCompleted : joi.boolean().default(false)
});

user.loginRequest = userRequest.concat(joi.object({
    loginType: joi.string().valid(["FB", "GPLUS", "EMAIL","TWITTER","LINKEDIN"]).required().description('Login source'),
    device   : device.required(),
    imageURL : joi.string(),
    location : common.location,
    timeZone : joi.string().description('current time zone').default('+05:30'),
    loginMode: joi.string().valid(["USER", "OWNER"]).required()
})).meta({className: 'LoginRequest'});

user.loginResponse = status.concat(joi.object({
    authorization: joi.string(),
    user         : userObj.concat(userDetail)
}).meta({className: 'LoginResponse'}));

user.guestLoginRequest = joi.object({
    device  : device,
    location: common.location
}).meta({className: 'GuestLoginRequest'});

user.guestLoginResponse = joi.object({
    authorization: joi.string().required()
}).meta({className: 'GuestLoginResponse'});

user.resetPasswordRequest = joi.object({
    email: joi.string().required()
}).meta({className: 'ResetPasswordRequest'});

user.resetPasswordResponse = status.required();

user.changePasswordRequest = joi.object({
    oldPassword    : joi.string().required(),
    newPassword    : joi.string().required(),
    confirmPassword: joi.string().required()
});

user.changePasswordResponse = status.required();

user.updateProfileRequest = joi.object({
    name       : joi.object({
        firstName: joi.string().description("First name of the user").required(),
        lastName : joi.string().description("Last name of the user")
    }),
    mail       : joi.object({
        mail           : joi.string().required(),
        currentPassword: joi.string(),
        password       : joi.string(),
        confirmPassword: joi.string()
    }),
    profession : joi.string(),
    description: joi.string(),
    mbNo       : joi.string().required(),
    imageKey   : joi.string().description("Image Key")
}).meta({className: 'UpdateProfileRequest'});

user.updateProfileCustomRequest = joi.object({
    name       : joi.object({
        firstName: joi.string().description("First name of the user").required(),
        lastName : joi.string().description("Last name of the user")
    }),
    mail       : joi.object({
        mail           : joi.string().required(),
        currentPassword: joi.string(),
        password       : joi.string(),
        confirmPassword: joi.string()
    }),
    profession : joi.string(),
    description: joi.string(),
    mbNo       : joi.string(),
    imageKey   : joi.string().description("Image Key"),
    buzzCount  : joi.number()
}).meta({className: 'UpdateProfileCustomRequest'});

user.updateProfileResponse = joi.any().required();

user.getProfileRequest = joi.object({
    id: joi.string()
});

user.getProfileResponse = status.concat(joi.object({
    user: userObj.concat(userDetail)
}).meta({className: 'GetProfileResponse'}));

user.settingsRequest = joi.object({
    pushNotiService: joi.boolean().default(false).description('Push Notification Service is ON or OFF'),
    locationService: joi.boolean().default(false).description('Location Service is ON or OFF'),
    historyLimit   : joi.number(),
    payoutMethod   : joi.string()
}).meta({className: 'SettingsRequest'});

user.settingsResponse = joi.any();

user.changeLoginModeRequest = joi.object({
    loginMode: joi.string().valid(["USER", "OWNER"]).required()
}).meta({className: 'ChangeLoginRequest'});

user.changeLoginModeResponse = joi.any();

user.logoutResponse = joi.object({
    authorization: joi.string().required()
});

user.getMultiUserDetailsRequest = joi.object({
    ids: joi.array().items(joi.string()).required()
}).meta({className: 'GetMultiUserRequest'});

user.getMultiUserDetailsResponse = joi.object({
    users: joi.array().items(userObj.concat(userDetail))
}).meta({className: 'GetMultiUserResponse'});

user.validateSessionRequest = joi.object({
    authorization: joi.string().required()
});

user.validateSessionResponse = userObj.concat(userDetail);

user.verifyEmailRequestParams = joi.object({
    email: joi.string().required()
}).meta({className: 'VerifyEmailRequest'});

user.verifyEmailRequest = joi.object({
    verifyCode: joi.string().required()
}).meta({className: 'VerifyEmailRequest'});

user.verifyEmailResponse = status;

user.verifyOtpRequest = joi.object({
    code : joi.string().required()
}).meta({className: 'VerifyOtpRequest'});

user.verifyOtpResponse = status.required();
//user.verifyOtpResponse = status.concat(joi.object({
//    user         : userObj.concat(userDetail)
//}).meta({className: 'LoginResponse'}));

user.debitBuzzCountForPropertyBuzzRequest = joi.object({
    id  : joi.string().required().description('UserId'),
    type: joi.string().required().valid(['PROPERTY', 'REQUIREMENT'])
});

user.debitBuzzCountForPropertyBuzzResponse = joi.boolean();

user.revertBuzzCountForPropertyBuzzRequest = joi.object({
    id  : joi.string().required().description("User id"),
    type: joi.string().required().valid(['PROPERTY', 'REQUIREMENT'])
});

user.revertBuzzCountForPropertyBuzzResponse = joi.boolean();

user.debitAckBuzzCountForBuzzRequest = joi.object({
    id    : joi.string().required().description("User id"),
    type  : joi.string().required().valid(['PROPERTY', 'REQUIREMENT']),
    action: joi.boolean().required()
});

user.debitAckBuzzCountForBuzzResponse = joi.boolean();

user.creditBuzzCountForInviteRequest = joi.object({
    id   : joi.string().required().description('UserId'),
    count: joi.number().required()
});

user.creditBuzzCountForInviteResponse = joi.boolean();

user.addViewCountRequest = joi.object({
    id  : joi.string().required().description('UserId'),
    type: joi.string().valid(["PROPERTY", "REQUIREMENT"])
});

user.addViewCountResponse = joi.boolean();

user.profileVerifyEmailUserRequestPayload = joi.object({
    loginType: joi.string().valid(["FB", "GPLUS", "EMAIL","TWITTER","LINKEDIN"]).required().description('Login source'),
    facebook : facebook,
    gplus    : gplus
});

user.profileVerifyEmailUserResponse = joi.boolean();

user.updateRecommendedRequirementCountRequest = joi.object({
    data: joi.array({
        userId  : joi.string().required(),
        reqCount: joi.number().required()
    })
});

user.updateRecommendedRequirementCountResponse = joi.boolean();

user.creditBuzzCountForPaymentRequest = joi.object({
    userId   : joi.string(),
    buzzCount: joi.number(),
    txnid    : joi.string()
});

user.creditBuzzCountForPaymentResponse = joi.boolean();

user.searchUsersByFilterRequest = joi.object({
    sortingKey: joi.string().default('createdDate').description('default createdDate'),
    sortBy    : joi.string().valid(["asc", "desc"]).default('desc').description('default desc'),
    filters   : joi.array().items(common.filter)
});

user.searchUserByFilterResponse = joi.object({
    sortingKey: joi.string().default('createdDate').description('default createdDate'),
    sortBy    : joi.string().valid(["asc", "desc"]).default('desc').description('default desc'),
    users     : joi.array().items(joi.object({
        id            : joi.string().description("Unique user id").required(),
        createdDate   : joi.date(),
        updatedDate   : joi.date(),
        regEmail      : joi.string(),
        name          : joi.object({
            firstName: joi.string().description("First name of the user"),
            lastName : joi.string().description("Last name of the user")
        }),
        facebook      : joi.object({
            fbId   : joi.string().required(),
            fbToken: joi.string().required(),
            mail   : joi.string()
        }),
        gplus         : joi.object({
            gmail     : joi.string().required(),
            gPlusToken: joi.string().required(),
            gPlusId   : joi.string().required()
        }),
        mail          : joi.object({
            mail    : joi.string().required(),
            password: joi.string()
        }),
        forgotPassword: joi.object({
            password: joi.string(),
            date    : joi.string()
        }),
        loginType     : joi.string().valid(["FB", "GPLUS", "EMAIL","TWITTER","LINKEDIN"]),
        profession    : joi.string(),
        description   : joi.string(),
        gender        : joi.string().valid(["MALE", "FEMALE", "UNSPECIFIED"]),
        dob           : joi.date(),
        mbNo          : joi.string(),
        imageURL      : joi.string(),
        imageKey      : joi.string().description("Image Key"),
        hometown      : joi.object({
            name       : joi.string().description("hometown name or address"),
            geoLocation: joi.object({
                lat: joi.number(),
                lon: joi.number()
            })
        }),
        status        : joi.string().valid(["INACTIVE", "ACTIVATED", "VERIFIED"]).required(),
        setupCompleted: joi.boolean().default(false),
        timeZone      : joi.string().description("Time zone of the user").default("+05:30"),
        buzzCount     : joi.number().default(0), // Total Buzz Count He have left

        propBuzzCount: joi.number().default(0), // Property Buzzed Count
        reqBuzzCount : joi.number().default(0), // Requirement Buzzed Count
        totBuzzCount : joi.number().default(0), // Total Buzzed Count

        propBuzzSCount: joi.number().default(0), // Property Buzzed success count
        propBuzzFCount: joi.number().default(0),  // Property Buzzed Failed Count

        reqBuzzSCount: joi.number().default(0), // Requirment Buzzed Success Count
        reqBuzzFCount: joi.number().default(0), // Requirement Buzzed Failed Count

        totRecvBuzzCount    : joi.number().default(0), // Total Received Buzz Count
        totPropRecvBuzzCount: joi.number().default(0), // Total Received for Property
        totReqRecvBuzzCount : joi.number().default(0), // Total Received for requirement
        propRecvBuzzSCount  : joi.number().default(0), // Property Success Received Buzz
        propRecvBuzzFCount  : joi.number().default(0), // Property Failure Received buzz
        reqRecvBuzzSCount   : joi.number().default(0), // Requirement Success Received Buzz
        reqRecvBuzzFCount   : joi.number().default(0), //Requirement Failure Received buzz

        propViewedCount: joi.number().default(0),
        reqViewedCount : joi.number().default(0),

        propOwn: joi.number().default(0),
        reqOwn : joi.number().default(0),

        inviteCount : joi.number().default(0),
        invitePoints: joi.number().default(0),

        pushNotiService: joi.boolean().default(false).description('Push Notification Service is ON or OFF'),
        locationService: joi.boolean().default(false).description('Location Service is ON or OFF'),
        historyLimit   : joi.number(),
        payoutMethod   : joi.string()
    }))
});

user.getDeviceInfoRequest = joi.object({
    userId  : joi.string().required(),
    deviceId: joi.string().required(),
    mode    : joi.string().valid(["ANDROID", "IOS", "WEB"]).required(),
});

user.getDeviceInfoResponse = joi.object({
    device: device.required()
});

///// ### FOR CMS


var userDetailForReport = joi.object({
    id                : joi.string().description("Unique user id").required(),
    createdDate       : joi.date(),
    updatedDate       : joi.date(),
    regEmail          : joi.string(),
    profession        : joi.string(),
    description       : joi.string(),
    gender            : joi.string().valid(["MALE", "FEMALE"]),
    dob               : joi.date(),
    mbNo              : joi.string(),
    imageKey          : joi.string().description("Image Key"),
    location          : common.location,
    status            : joi.string().valid(["INACTIVE", "ACTIVATED", "VERIFIED"]).required(),
    timeZone          : joi.string().description("Time zone of the user").default("+05:30"),
    buzzCount         : joi.number(),
    propBuzzCount     : joi.number().default(0),
    propRecvBuzzSCount: joi.number().default(0),
    propViewedCount   : joi.number().default(0),
    propOwn           : joi.number().default(0),
    setupCompleted    : joi.boolean().default(false)
});

user.userReportRequest = joi.object({
    index           : joi.number().default(0),
    limit           : joi.number().default(50),
    lastReceivedDate: joi.date(),
    sortingKey      : joi.string(),
    sortBy          : joi.string().valid(["asc", "desc"]),
    filters         : joi.array().items(common.filter)
}).meta({className: "UserReportRequest"});

user.userReportResponse = joi.object({
    index           : joi.number(),
    limit           : joi.number(),
    total           : joi.number(),
    lastReceivedDate: joi.date(),
    sortingKey      : joi.string(),
    sortBy          : joi.string().valid(["asc", "desc"]),
    user            : joi.array().items(userDetailForReport)
}).meta({className: "UserReportResponse"});

var buzzUserInfo = joi.object({
    id           : joi.string().description("Unique user id").required(),
    name         : name,
    createdDate  : joi.date(),
    regEmail     : joi.string(),
    profession   : joi.string(),
    description  : joi.string(),
    gender       : joi.string().valid(["MALE", "FEMALE"]),
    dob          : joi.date(),
    mbNo         : joi.string(),
    imageKey     : joi.string().description("Image Key"),
    buzzCount    : joi.number(),
    propBuzzCount: joi.number(),
    reqBuzzCount : joi.number()
}).meta({className: 'BuzzUserInfo'});

user.searchSharedReqListResponse = joi.object({
    index     : joi.number(),
    limit     : joi.number(),
    total     : joi.number(),
    lstRecvDt : joi.date(),
    sortingKey: joi.string(),
    sortBy    : joi.string().valid(["asc", "desc"]),
    text      : joi.string().required(),
    users     : joi.array().items(buzzUserInfo)
});

user.searchSharedReqListRequest = common.globalSearchRequest.concat(joi.object({
    userIds: joi.array().items(joi.string()).required()
}));

user.globalSearchRequest = common.globalSearchRequest;

user.searchUserListResponse = joi.object({
    index     : joi.number(),
    limit     : joi.number(),
    total     : joi.number(),
    lstRecvDt : joi.date(),
    sortingKey: joi.string(),
    sortBy    : joi.string().valid(["asc", "desc"]),
    text      : joi.string().required(),
    users     : joi.array().items(userDetail)
});

user.resendOTPResponse = status.required();

module.exports = user;
