/**
 * Created by hmspl on 10/9/16.
 */
/**
 * Created by jaya on 12/07/16.
 */

var joi = require('joi');

var RES_MSG = require('common-utils').RES_MSG;
var SCHEMA  = require('common-utils').SCHEMA.onelogin.onelogin;

var nodeCtrl = require('../controller/user');
//var SCHEMA   = require('../schema/user');

module.exports = function () {
    return [
        {
            method: 'POST',
            path  : '/user/login',
            config: {
                auth       : false,
                handler    : nodeCtrl.login,
                description: 'login API',
                tags       : ['api'],
                notes      : [
                    'login in to their own account'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    payload: SCHEMA.loginRequest
                },
                response   : {
                    schema: SCHEMA.loginResponse
                }
            }
        },
        {
            method: 'POST',
            path  : '/user/verify_otp',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.verifyOtp,
                description: 'verify opt for user mobile login API',
                tags       : ['api'],
                notes      : [
                    'opt verification'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown(),
                    payload: SCHEMA.verifyOtpRequest
                },
                response   : {
                    schema: SCHEMA.verifyOtpResponse
                }
            }
        },
        {
            method: 'GET',
            path  : '/user/reset_password/{email}',
            config: {
                auth       : false,
                handler    : nodeCtrl.resetPassword,
                description: 'resetPassword API',
                tags       : ['api'],
                notes      : [
                    'reset the password of registered user'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    params: SCHEMA.resetPasswordRequest
                },
                response   : {
                    schema: SCHEMA.resetPasswordResponse
                }
            }
        },
        {
            method: 'POST',
            path  : '/user/changePassword',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.changePasswordUser,
                description: 'changePassword API',
                tags       : ['api'],
                notes      : [
                    'change the current password of the user'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown(),
                    payload: SCHEMA.changePasswordRequest
                },
                response   : {
                    schema: SCHEMA.changePasswordResponse
                }
            }
        },
        {
            method: 'POST',
            path  : '/user/updateProfile',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.updateProfile,
                description: 'update user profile data',
                tags       : ['api'],
                notes      : [
                    'update the data in the user profile'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown(),
                    payload: SCHEMA.updateProfileRequest
                },
                response   : {
                    schema: SCHEMA.updateProfileResponse
                }
            }
        },
        {
            method: 'GET',
            path  : '/user/getProfile/{id}',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.getProfile,
                description: 'getProfile api',
                tags       : ['api'],
                notes      : [
                    'get user profile'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown(),
                    params : SCHEMA.getProfileRequest
                },
                response   : {
                    schema: SCHEMA.getProfileResponse
                }
            }
        },
        {
            method: 'PUT',
            path  : '/user/verifyEmail/{email}',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.verifyEmail,
                description: 'verifyEmail api',
                tags       : ['api'],
                notes      : [
                    'verifyEmail'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown(),
                    payload: SCHEMA.verifyEmailRequest,
                    params : SCHEMA.verifyEmailRequestParams
                },
                response   : {
                    schema: SCHEMA.verifyEmailResponse
                }
            }
        },
        {
            method: 'POST',
            path  : '/user/logout',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.logout,
                description: 'logout api',
                tags       : ['api'],
                notes      : [
                    'logout'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown()
                },
                response   : {
                    schema: SCHEMA.logoutResponse
                }
            }
        },
        {
            method: 'POST',
            path  : '/user/resend_otp',
            config: {
                auth       : 'hmauth',
                handler    : nodeCtrl.resendOTP,
                description: 'Resend OTP',
                tags       : ['api'],
                notes      : [
                    'Resend OTP'
                ],
                plugins    : {
                    'hapi-swagger': {
                        responseMessages: [
                            RES_MSG.RES_SUCCESS,
                            RES_MSG.RES_BAD_REQUEST,
                            RES_MSG.RES_INT_SERVER_ERR
                        ]
                    }
                },
                validate   : {
                    headers: joi.object({
                        authorization: joi.string().required()
                    }).unknown(),
                    payload: SCHEMA.resendOTPRequestPayload
                },
                response   : {
                    schema: SCHEMA.resendOTPResponse
                }
            }
        }
    ]
}();
