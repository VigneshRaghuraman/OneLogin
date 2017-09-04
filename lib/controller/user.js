/**
 * Created by jaya on 24/08/15.
 */

var joi = require('joi');

var RES_MSG = require('common-utils').RES_MSG;
var Util    = require('common-utils').util;
var SCHEMA  = require('common-utils').SCHEMA.onelogin.onelogin;

var userModel = require('../model/user');

var moduleId = "user"

/**
 * SingIn/Singup User Account
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.login = function (req, reply) {
    var methodName = 'login';
    try {
        var payload = req.payload;

        var controllerRequest = {
            methodName          : methodName,
            apiId               : methodName,
            moduleId            : moduleId,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.loginRequest,
            responseSchema      : SCHEMA.loginResponse,
            auth                : null,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.doLogin
        };
        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * User guest login
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.guestLogin = function (req, reply) {

    var methodName = 'guestLogin';
    try {

        var controllerRequest = {
            methodName          : methodName,
            apiId               : methodName,
            moduleId            : moduleId,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.guestLoginRequest,
            responseSchema      : SCHEMA.guestLoginResponse,
            auth                : null,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.guestLogin
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Reset Password
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.resetPassword = function (req, reply) {

    var methodName = 'resetPassword';
    try {
        var params = req.params;

        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : SCHEMA.resetPasswordRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.resetPasswordResponse,
            auth                : null,
            params              : params,
            query               : null,
            payload             : null,
            method              : userModel.resetPassword
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log(err)
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};


/**
 * Change Password
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.changePasswordUser = function (req, reply) {

    var methodName = 'changePasswordUser';
    try {
        var payload           = req.payload;
        var auth              = req.auth.credentials;
        var controllerRequest = {
            methodName          : methodName,
            apiId               : methodName,
            moduleId            : moduleId,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.changePasswordRequest,
            responseSchema      : SCHEMA.changePasswordResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.changePasswordUser
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.verifyOtp = function (req, reply) {

    var methodName = 'verifyOtp';
    try {
        var payload           = req.payload;
        var auth              = req.auth.credentials;
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.verifyOtpResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.verifyOtp
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Update profile
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.updateProfile = function (req, reply) {

    var methodName = 'updateProfile';
    try {
        var payload = req.payload;
        var auth    = req.auth.credentials;

        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.updateProfileRequest,
            responseSchema      : SCHEMA.updateProfileResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.updateProfile
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Update profile For Custom Method
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.updateProfileCustom = function (req, reply) {

    var methodName = 'updateProfileCustom';
    try {
        var payload = req.payload;
        var auth    = req.auth;

        var controllerRequest = {
            methodName          : methodName,
            moduleId            : "onelogin",
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.updateProfileCustomRequest,
            responseSchema      : SCHEMA.updateProfileResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.updateProfileCustom
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Validate session data
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.validateSession = function (req, reply) {
    var methodName = 'validateSession';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.validateSessionRequest,
            responseSchema      : SCHEMA.validateSessionResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.validateSession
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Validate session data
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.validateSessionForInActiveUsers = function (req, reply) {
    var methodName = 'validateSessionForInActiveUsers';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : "onelogin",
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.validateSessionRequest,
            responseSchema      : null,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.validateSessionForInActiveUsers
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Get profile information
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.getProfile = function (req, reply) {
    console.log(req)
    var methodName = 'getProfile';
    try {
        var controllerRequest = {
            methodName          : methodName,
            apiId               : methodName,
            moduleId            : moduleId,
            requestParamSchema  : SCHEMA.getProfileRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.getProfileResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.getProfile
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.getProfileForMicroApp = function (req, reply) {

    var methodName = 'getProfileForMicroApp';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : "onelogin",
            requestParamSchema  : SCHEMA.getProfileRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.getProfileResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.getProfileForMicroApp
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Personal Settings
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.settings = function (req, reply) {

    var methodName = 'settings';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : "onelogin",
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.settingsRequest,
            responseSchema      : SCHEMA.settingsResponse,
            auth                : req.auth.credentials,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.setSettings
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};


/**
 * Verify Email
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.verifyEmail = function (req, reply) {

    var methodName = 'verifyEmail';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : SCHEMA.verifyEmailRequestParams,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.verifyEmailRequest,
            responseSchema      : SCHEMA.verifyEmailResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.verifyEmail
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Logout from session
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.logout = function (req, reply) {
    var methodName = 'logout';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.logoutResponse,
            auth                : req.auth.credentials,
            params              : null,
            query               : null,
            payload             : null,
            method              : userModel.logout
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};


/**
 * Change Login mode
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.changeLoginMode = function (req, reply) {
    var methodName = 'changeLoginMode';
    try {
        var controllerRequest = {
            methodName          : methodName,
            moduleId            : moduleId,
            apiId               : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.changeLoginModeRequest,
            responseSchema      : SCHEMA.changeLoginModeResponse,
            auth                : req.auth.credentials,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.changeLoginMode
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Get Multi users details
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.getMultiUsers = function (req, reply) {
    var methodName = 'getMultiUserDetails';
    try {
        var payload = req.payload;
        var auth    = req.auth.credentials;

        var controllerRequest = {
            methodName          : methodName,
            apiId               : methodName,
            moduleId            : moduleId,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.getMultiUserDetailsRequest,
            responseSchema      : SCHEMA.getMultiUserDetailsResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.getMultiUserDetails
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Manipulate the BuzzCount for buzz
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.debitBuzzCountForBuzz = function (req, reply) {

    var methodName = 'debitBuzzCountForBuzz';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.debitBuzzCountForPropertyBuzzRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.debitBuzzCountForPropertyBuzzResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.debitBuzzCountForBuzz
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Revert the BuzzCount for buzz
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.revertBuzzCountForBuzz = function (req, reply) {

    var methodName = 'revertBuzzCountForBuzz';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.revertBuzzCountForPropertyBuzzRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.revertBuzzCountForPropertyBuzzResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.revertBuzzCountForBuzz
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Manipulate the Buzz Received Count for buzz
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.debitBuzzReceivedCountForBuzz = function (req, reply) {

    var methodName = 'debitBuzzReceivedCountForBuzz';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.debitBuzzCountForPropertyBuzzRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.debitBuzzCountForPropertyBuzzResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.debitBuzzReceivedCountForBuzz
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Revert the Buzz Received Count for  buzz
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.revertBuzzReceivedCountForBuzz = function (req, reply) {

    var methodName = 'revertBuzzReceivedCountForBuzz';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.revertBuzzCountForPropertyBuzzRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.revertBuzzCountForPropertyBuzzResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.revertBuzzReceivedCountForBuzz
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**Manipulate buzz ack count for user
 *
 * @param req
 * @param reply
 * @returns {*}
 */
exports.debitAckBuzzCountForBuzz = function (req, reply) {

    var methodName = 'debitAckBuzzCountForBuzz';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.debitAckBuzzCountForBuzzRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.debitAckBuzzCountForBuzzResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.debitAckBuzzCountForBuzz
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**Manipulate buzz count for owner
 *
 * @param req
 * @param reply
 * @returns {*}
 */
exports.debitAckBuzzCountForBuzzOwner = function (req, reply) {

    var methodName = 'debitAckBuzzCountForBuzzOwner';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.debitAckBuzzCountForBuzzRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.debitAckBuzzCountForBuzzResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.debitAckBuzzCountForBuzzOwner
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.addViewCountInUserDocument = function (req, reply) {

    var methodName = 'addViewCountInUserDocument';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : SCHEMA.addViewCountRequest,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.addViewCountResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.addViewCountInUserDocument
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.updateRecommendedRequirementCount = function (req, reply) {

    var methodName = 'updateRecommendedRequirementCount';
    try {
        var payload = req.payload;
        var auth    = req.auth;

        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.updateRecommendedRequirementCountRequest,
            responseSchema      : SCHEMA.updateRecommendedRequirementCountResponse,
            auth                : null,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.updateRecommendedRequirementCount
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Credit the BuzzCount for App Invite
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.creditBuzzCountForInvite = function (req, reply) {

    var methodName = 'creditBuzzCountForInvite';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.creditBuzzCountForInviteRequest,
            responseSchema      : SCHEMA.creditBuzzCountForInviteResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.creditBuzzCountForInvite
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**
 * Verify profile for email user
 * @param {Object} req  Required
 * @param {function} reply  Callback function
 */
exports.profileVerifyEmailUser = function (req, reply) {

    var methodName = 'profileVerifyEmailUser';
    try {
        var payload = req.payload;
        var auth    = req.auth;

        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.profileVerifyEmailUserRequestPayload,
            responseSchema      : SCHEMA.profileVerifyEmailUserResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.profileVerifyEmailUser
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.creditBuzzCountForPayment = function (req, reply) {
    var methodName = 'creditBuzzCountForPayment';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.creditBuzzCountForPaymentRequest,
            responseSchema      : SCHEMA.creditBuzzCountForPaymentResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.creditBuzzCountForPayment
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.searchUsersByFilter = function (req, reply) {
    var methodName = 'searchUsersByFilter';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.searchUsersByFilterRequest,
            responseSchema      : SCHEMA.searchUserByFilterResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.searchUserByFilter
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

///// ################# For CMS

exports.userReport = function (req, reply) {
    var methodName = 'userReport';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.userReportRequest,
            responseSchema      : SCHEMA.userReportResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.getUserReport
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.searchUserForSharedRequirement = function (req, reply) {
    var methodName = 'searchUserForSharedRequirement';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.searchSharedReqListRequest,
            responseSchema      : SCHEMA.searchSharedReqListResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.searchUserForSharedRequirement
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

exports.searchUsersListCMS = function (req, reply) {
    var methodName = 'searchUsersListCMS';
    try {
        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.globalSearchRequest,
            responseSchema      : SCHEMA.searchUserListResponse,
            auth                : req.auth,
            params              : req.params,
            query               : req.query,
            payload             : req.payload,
            method              : userModel.searchUsersListCMS
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};

/**Get Device Info by DeviceId && userId && mode
 *
 * @param req {payload -{Object}}
 * @param reply
 * @returns {*}
 */
exports.getDeviceInfo = function (req, reply) {

    var methodName = 'getDeviceInfo';
    try {
        var payload = req.payload;
        var auth    = req.auth;

        var controllerRequest = {
            methodName          : methodName,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: SCHEMA.getDeviceInfoRequest,
            responseSchema      : SCHEMA.getDeviceInfoResponse,
            auth                : auth,
            params              : null,
            query               : null,
            payload             : payload,
            method              : userModel.getDeviceInfo
        };

        Util.modelMethodInvokerServer(controllerRequest, reply);

    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};


//resend OTP

exports.resendOTP = function (req, reply) {
    var methodName = 'resendOTP';
    try {
        var controllerRequest = {
            methodName          : methodName,
            apiId               : methodName,
            moduleId            : moduleId,
            requestParamSchema  : null,
            requestQuerySchema  : null,
            requestPayloadSchema: null,
            responseSchema      : SCHEMA.resendOTPResponse,
            auth                : req.auth.credentials,
            params              : null,
            query               : null,
            payload             : req.payload,
            method              : userModel.resendOTP
        };
        Util.modelMethodInvokerServer(controllerRequest, reply);
    } catch (err) {
        console.log('NAME:' + methodName + ', RESPONSE:' + JSON.stringify(err.stack));
        return reply({code: 555, message: JSON.stringify(err.stack)});
    }
};