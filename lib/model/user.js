/**
 * Created by jaya on 24/08/15.
 */
var shortId     = require('shortid');
var moment      = require('moment');
var async       = require('async');
var _           = require('underscore');
var joi         = require('joi');
var commonUtils = require('common-utils');

var Utils    = commonUtils.util;
var RESP_MSG = commonUtils.RES_MSG1;
var dbKeys   = commonUtils.KEY_PREFIX;

var EMAIL_DATA_SCHEMA    = commonUtils.DATA.email;
var GPLUS_DATA_SCHEMA    = commonUtils.DATA.gplus;
var TWITTER_SCHEMA       = commonUtils.DATA.twitter;
var LINKEDIN_SCHEMA      = commonUtils.DATA.linkedIn;
var FB_DATA_SCHEMA       = commonUtils.DATA.fb;
var USER_DATA_SCHEMA     = commonUtils.DATA.user;
var USER_DEV_DATA_SCHEMA = commonUtils.DATA.deviceInfo;
var DEVCIE_DATA_SCHEMA   = commonUtils.DATA.device;
var AUTH_DATA_SCHEMA     = commonUtils.DATA.auth;
var SESSION_DATA_SCHEMA  = commonUtils.DATA.session;
var RES_MSG              = commonUtils.RES_MSG;
var CB_ERR               = commonUtils.CB_ERR;

var mailerService = require('../service/mailer');
var userService   = require('../service/user');
var commonService = require('../service/common');
var constantQuery = require('../constant/query');
var appConfig     = require('../config/app');

var bucketName = appConfig.database.couchbase.user.bucketName;

var moduleId = "user";

var user = {};

user.test = function (reqObj, callback) {
    return callback(null, 'ok');
};

user.guestLogin = function (request, callback) {
    var auth       = request.auth;
    var payload    = request.payload;
    var apiId      = request.apiId;
    var moduleId   = request.moduleId;
    var MSG_CODE   = RESP_MSG[moduleId][apiId];
    payload.userId = auth.userId;

    var authData = {
        type         : 'authentication',
        authorization: Utils.generateRandomString(30, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'),
        device       : payload.device,
        location     : payload.location,
        accountMode  : 'GUEST',
        cDate        : moment().toISOString(),
        updatedDate  : moment().toISOString()
    };

    createAuthDocument(authData, MSG_CODE, function (err, result) {
        if (!err) {
            return callback(null, {authorization: authData.authorization});
        } else {
            return callback(err);
        }
    });
};

/**
 * SignIn / SignUp User
 *
 * @param {Object} request
 * @param callback
 * @returns {*}
 */
user.doLogin = function (request, callback) {
    var payload             = request.payload;
    var apiId               = request.apiId;
    var moduleId            = request.moduleId;
    var MSG_CODE            = RESP_MSG[moduleId][apiId];
    var task                = [];
    var userData, isNewUser = false;

    if (payload.loginType == 'FB') {
        if (payload.facebook) {
            task.push(function (innerCb) {
                signInByFb(payload, MSG_CODE, function (err, res, newUser) {
                    if (!err) {
                        userData  = res;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            });
        } else {
            return callback(MSG_CODE.RES_BAD_REQUEST);
        }
    }

    if (payload.loginType == 'GPLUS') {
        if (payload.gplus) {
            task.push(function (innerCb) {
                signInByGplus(payload, MSG_CODE, function (err, res, newUser) {
                    if (!err) {
                        userData  = res;
                        isNewUser = newUser;
                        return innerCb();

                    } else {
                        return innerCb(err);
                    }
                });
            });
        } else {
            return callback(MSG_CODE.RES_BAD_REQUEST);
        }
    }

    if (payload.loginType == 'EMAIL') {
        if (payload.mail) {
            task.push(function (innerCb) {
                signInByEmail(payload, MSG_CODE, function (err, res, newUser) {
                    if (!err) {
                        userData  = res;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            });
        } else {
            return callback(MSG_CODE.RES_BAD_REQUEST);
        }
    }

    if (payload.loginType == 'MOBILE') {
        if (payload.mobile) {
            task.push(function (innerCb) {
                signInByMobile(payload, function (err, res, newUser) {
                    if (!err) {
                        userData  = res;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            });
        } else {
            return callback(MSG_CODE.RES_BAD_REQUEST);
        }
    }

    if (payload.loginType == 'TWITTER') {
        if (payload.twitter) {
            task.push(function (innerCb) {
                signInByTwitter(payload, MSG_CODE, function (err, res, newUser) {
                    if (!err) {
                        userData  = res;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            });
        } else {
            return callback(MSG_CODE.RES_BAD_REQUEST);
        }
    }

    if (payload.loginType == 'LINKEDIN') {
        if (payload.linkedIn) {
            task.push(function (innerCb) {
                signInByLinkedIn(payload, MSG_CODE, function (err, res, newUser) {
                    if (!err) {
                        userData  = res;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            });
        } else {
            return callback(MSG_CODE.RES_BAD_REQUEST);
        }
    }

    task.push(function (innerCb) {
        userData.authorization = Utils.generateRandomString(30, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
        userData.device        = payload.device;
        userData.userId        = userData.id;
        userData.loginMode     = payload.loginMode;
        userData.loginType     = payload.loginType;
        userData.accountMode   = 'ACCOUNT_HOLDER';

        if (payload.location) {
            userData.location = payload.location;
        }

        if (payload.loginType == 'MOBILE') {
            userData.otp = {
                code    : Utils.getRandomNumber(6),
                mobileNo: userData.mobile.number,
                date    : moment().toISOString(),
                verified: false
            }
        }

        createAuthDocument(userData, MSG_CODE, innerCb);
    });

    if (payload.device && payload.device.deviceId) {
        task.push(function (innercb) {
            deviceDataDocument(userData, MSG_CODE, innercb)
        });

        task.push(function (innerCb) {
            persistDeviceDocument(userData, MSG_CODE, innerCb);
        });
    }

    async.series(task, function (err, result) {
        if (!err) {
            var response = {
                user         : userData,
                authorization: userData.authorization
            };

            if (payload.loginType == 'MOBILE') {
                response = {
                    authorization: userData.authorization
                }
            } else {
                response = {
                    authorization: userData.authorization,
                    user         : userData
                };
            }
            response = _.extend(Utils.buildSuccessResponse(MSG_CODE.RES_SUCCESS), response);
            return callback(null, response);
        } else {
            return callback(err);
        }
    });
};

/**
 * signInBy FB
 * @param payload
 * @param callback
 */
function signInByFb(payload, MSG_CODE, callback) {
    var facebook            = payload.facebook;
    var userData, isNewUser = false;

    async.waterfall([
        function (innerCb) {
            getFbDocument(facebook.fbId, function (err, result) {
                if (!err && result.length > 0) {
                    innerCb(null, result);
                } else {
                    innerCb(null, null);
                }

            })
        },
        function (fbDoc, innerCb) {
            if (fbDoc != null && fbDoc.length > 0) {
                var fbData = fbDoc[0][bucketName];
                var userId = fbData.userId;
                getUserDocument(userId, function (err, userDoc) {
                    if (!err && userDoc.length > 0) {
                        userData          = userDoc[0][bucketName];
                        userData.facebook = facebook;
                        getUpdatePayloadData(userData, payload, function (err, result) {
                            if (!err) {
                                userData = result;
                                Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                    if (!err) {
                                        result.id = userData.id;
                                        updateUserDocumentCommon(result, function (err, res) {
                                            if (!err) {
                                                return innerCb();
                                            } else {
                                                return innerCb(err);
                                            }
                                        })
                                    }
                                })
                            } else {
                                return innerCb(err);
                            }
                        })

                    } else {
                        console.log(MSG_CODE.RES_USER_NOT_EXISTS)
                        return innerCb(MSG_CODE.RES_USER_NOT_EXISTS);
                    }
                })

            } else {
                createFBUser(payload, MSG_CODE, function (err, result, newUser) {
                    if (!err) {
                        userData  = result;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            }
        }
    ], function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * createFB User
 * @param payload
 * @param callback
 */
function createFBUser(payload, MSG_CODE, callback) {
    var task;
    var userData, isNewUser = false;
    var fbMailId            = payload.facebook.mail;

    if (fbMailId) {
        task = [];
        var userId;
        task.push(function (innerCb) {
            getUserEmailDocument(fbMailId, function (err, res) {
                if (!err && res.length > 0) {
                    userId = res[0][bucketName].userId;
                    innerCb();
                } else {
                    innerCb(err);
                }
            })
        });

        task.push(function (innerCb) {
            if (userId) {
                getUserDocument(userId, function (err, result) {
                    if (!err && result.length > 0) {
                        userData = result[0][bucketName]
                        if (!userData.facebook || (userData.facebook && userData.facebook.fbId == payload.facebook.fbId)) {
                            payload.userId = userId;
                            payload.id     = payload.facebook.fbId;
                            payload.status = 'VERIFIED';
                            createFBDocument(payload, MSG_CODE, function (err, res) {
                                if (!err) {
                                    if (userData.status != 'VERIFIED') {
                                        var req = {
                                            userId   : userData.id,
                                            updateKey: 'status',
                                            data     : 'VERIFIED'
                                        };
                                        getUpdatePayloadData(userData, payload, function (err, result) {
                                            if (!err) {
                                                userData = result;
                                                Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                                    if (!err) {
                                                        result.id = userData.id;
                                                        updateUserDocumentCommon(result, function (err, res) {
                                                            if (!err) {
                                                                return innerCb();
                                                            } else {
                                                                return innerCb(err);
                                                            }
                                                        })
                                                    }
                                                })
                                            } else {
                                                return innerCb(err);
                                            }
                                        })
                                    }
                                } else {
                                    return innerCb(err);
                                }
                            });
                        } else {
                            //Create Fresh User without that mail id. because that mail id already mapped with other fb account.
                            isNewUser = true;
                            userService.createUserId(function (err, res) {
                                if (!err) {
                                    payload.userId = res;
                                    payload.id     = payload.facebook.fbId;
                                    payload.status = 'VERIFIED';
                                    delete payload.facebook.mail;

                                    createFBDocument(payload, MSG_CODE, function (err, res) {
                                        if (!err) {
                                            var userDoc = Utils.cloneObject(payload);
                                            createUserDocument(userDoc, MSG_CODE, function (err, result) {
                                                if (!err) {
                                                    userData = result;
                                                    return innerCb();
                                                } else {
                                                    return innerCb(err);
                                                }
                                            });
                                        } else {
                                            return innerCb(err);
                                        }
                                    });
                                } else {
                                    console.log('ERROR WHILE GENERATING USERID ', err);
                                    return innerCb(err);
                                }
                            });
                        }
                    } else {
                        innerCb(err);
                    }

                })
            } else {
                isNewUser = true;
                userService.createUserId(function (err, res) {
                    if (err) {
                        console.log('ERROR WHILE GENERATING USERID ', err);
                        return innerCb(err);
                    } else {
                        payload.userId   = res;
                        payload.id       = payload.facebook.fbId;
                        payload.status   = 'VERIFIED';
                        payload.regEmail = payload.facebook.mail;

                        createFBDocument(payload, MSG_CODE, function (err, res) {
                            if (!err) {
                                var userDoc = Utils.cloneObject(payload);
                                createUserDocument(userDoc, MSG_CODE, function (err, result) {
                                    if (!err) {
                                        userData     = result;
                                        payload.mail = {
                                            mail: payload.facebook.mail
                                        };
                                        createEmailDocument(payload, MSG_CODE, innerCb);
                                    } else {
                                        console.log(err);
                                        return innerCb(err);
                                    }
                                });
                            } else {
                                return innerCb(err);
                            }
                        });
                    }
                });
            }
        });
    } else {
        payload.id     = payload.facebook.fbId;
        payload.status = 'ACTIVE';
        task           = [];
        isNewUser      = true;

        task.push(function (innerCb) {
            userService.createUserId(function (err, res) {
                if (err) {
                    console.log('ERROR WHILE GENERATING USERID ', err);
                    return innerCb(err);
                } else {
                    payload.userId = res;
                    return innerCb();
                }
            });
        });

        task.push(function (innerCb) {
            createFBDocument(payload, MSG_CODE, innerCb);
        });

        task.push(function (innerCb) {
            var userDoc = Utils.cloneObject(payload);
            createUserDocument(userDoc, MSG_CODE, function (err, result) {
                if (!err) {
                    userData = result;
                    return innerCb();
                } else {
                    return innerCb(err);
                }
            });
        });
    }

    async.series(task, function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * signInBy Gplus
 * @param payload
 * @param callback
 */
function signInByGplus(payload, MSG_CODE, callback) {
    var gplus               = payload.gplus;
    var userData, isNewUser = false;
    async.waterfall([
        function (innerCb) {
            getGplusDocument(gplus.gPlusId, function (err, res) {
                if (!err && res.length > 0) {
                    return innerCb(null, res);
                } else {
                    return innerCb(null, null);
                }
            })
        },
        function (gplusDoc, innerCb) {
            if (gplusDoc != null && gplusDoc.length > 0) {
                var gPlusData = gplusDoc[0][bucketName];
                var userId    = gPlusData.userId;
                getUserDocument(userId, function (err, result) {
                    if (!err && result.length > 0) {
                        userData          = result[0][bucketName];
                        userData.facebook = facebook;
                        getUpdatePayloadData(userData, payload, function (err, result) {
                            if (!err) {
                                userData = result;
                                Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                    if (!err) {
                                        result.id = userData.id;
                                        updateUserDocumentCommon(result, function (err, res) {
                                            if (!err) {
                                                return innerCb();
                                            } else {
                                                return innerCb(err);
                                            }
                                        })
                                    }
                                })
                            } else {
                                return innerCb(err);
                            }
                        })
                    } else {
                        return innerCb(MSG_CODE.RES_USER_NOT_EXISTS);
                    }
                });
            } else {
                createGPlusUser(payload, MSG_CODE, function (err, result, newUser) {
                    if (!err) {
                        userData  = result;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            }
        },
        function (innerCb) {
            if (!userData.regEmail) {
                var insertKey    = '"' + dbKeys.USER + userData.id + '"';
                var reqObjParams = {
                    bucketName: bucketName,
                    key       : insertKey,
                    updateKey : 'regEmail',
                    data      : gplus.gmail
                };
                updateUserDoc(reqObjParams, function (err, res) {
                    if (!err) {
                        return innerCb();
                    } else {
                        return innerCb(err)
                    }
                })
            } else {
                return innerCb();
            }
        }
    ], function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * createGPlus User
 * @param payload
 * @param callback
 */
function createGPlusUser(payload, MSG_CODE, callback) {

    var task                = [];
    var userData, isNewUser = false;
    var mail                = payload.gplus.gmail;
    var userId;

    getEmailDocument(mail, function (err, result) {
        if (!err && result.length > 0) {
            var eMailData  = result[0][bucketName];
            userId         = eMailData.userId;
            payload.userId = userId;
            payload.id     = eMailData.id;
            payload.status = 'VERIFIED';
            task.push(function (innerCb) {
                createGPlusDocument(payload, MSG_CODE, function (err, result) {
                    if (!err) {
                        return innerCb()
                    } else {
                        return innerCb(err)
                    }
                });
            });

            task.push(function (innerCb) {
                getUserDocument(userId, function (err, result) {
                    if (!err && result.length > 0) {
                        userData       = result[0][bucketName];
                        userData.gplus = payload.gplus;
                        getUpdatePayloadData(userData, payload, function (err, result) {
                            if (!err) {
                                userData = result;
                                Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                    if (!err) {
                                        result.id = userData.id;
                                        updateUserDocumentCommon(result, function (err, res) {
                                            if (!err) {
                                                return innerCb();
                                            } else {
                                                return innerCb(err);
                                            }
                                        })
                                    } else {
                                        return innerCb();
                                    }
                                })
                            } else {
                                return innerCb(err)
                            }
                        })
                    } else {
                        return callback(err)
                    }

                });

            });
        } else {
            payload.id       = payload.gplus.gmail;
            payload.regEmail = payload.gplus.gmail;
            payload.status   = 'VERIFIED';
            isNewUser        = true;
            task.push(function (innerCb) {
                userService.createUserId(function (err, res) {
                    if (err) {
                        console.log('ERROR WHILE GENERATING USERID ', err);
                        return innerCb(err);
                    } else {
                        payload.userId = res;
                        return innerCb();
                    }
                });
            });

            task.push(function (innerCb) {
                createGPlusDocument(payload, MSG_CODE, innerCb);
            });

            task.push(function (innerCb) {
                var userDoc = Utils.cloneObject(payload);
                createUserDocument(userDoc, MSG_CODE, function (err, result) {
                    if (!err) {
                        userData = result;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            });

            task.push(function (innerCb) {
                var emailDoc = Utils.cloneObject(payload);

                emailDoc.mail = {
                    mail: payload.gplus.gmail
                };
                createEmailDocument(emailDoc, MSG_CODE, innerCb);
            });
        }

        async.series(task, function (err, result) {
            if (!err) {
                return callback(null, userData, isNewUser);
            } else {
                return callback(err);
            }
        });
    })
}

/**
 * signInBy Email
 * @param payload
 * @param {Message Code} MSG_CODE
 * @param callback
 */

function signInByEmail(payload, MSG_CODE, callback) {
    var mail     = payload.mail.mail;
    var password = payload.mail.password;
    console.log(mail);
    var userId, userData, isNewUser;
    var tasks    = [];
    var emailDoc = {};

    tasks.push(function (outerCb) {
        getEmailDocument(mail, function (err, result) {
            if (!err && result.length > 0) {
                emailDoc        = result[0][bucketName];
                emailDoc.signUp = false;
                return outerCb(null, emailDoc)
            } else {
                emailDoc.signUp = true;
                return outerCb(null, emailDoc)
            }
        });

    })

    tasks.push(function (emailDocument, outerCb) {
        if (emailDocument.signUp != false) {
            createEmailUser(payload, MSG_CODE, function (err, result, newUser) {
                if (!err) {
                    userData  = result;
                    isNewUser = newUser;
                    return outerCb(null, userData, isNewUser);
                } else {
                    return outerCb(MSG_CODE.RES_INT_SERVER_ERR);
                }
            });
        }
        else {
            async.waterfall([
                    function (innerCb) {
                        userId = emailDocument.userId;
                        getUserDocument(userId, function (err, resUserDoc) {
                            if (!err && resUserDoc.length > 0) {
                                userData    = resUserDoc[0][bucketName];
                                var userPwd = Utils.encryptString(password);

                                if (userData.forgotPassword && userData.forgotPassword.password == userPwd) {
                                    userData.forgotPassword = {};
                                    var mailObj             = {
                                        mail           : mail,
                                        oldPassword    : userPwd,
                                        newPassword    : userPwd,
                                        currentPassword: userPwd

                                    };
                                    userData.mail           = mailObj;

                                    Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                        if (!err) {
                                            result.id = userData.id;
                                            updateUserDocumentCommon(result, function (err, res) {
                                                if (!err) {
                                                    return innerCb();
                                                } else {
                                                    return innerCb(err);
                                                }
                                            })
                                        }
                                    })

                                } else if (userData.mail && (userData.mail.oldPassword || userData.mail.currentPassword)) {
                                    if (userData.mail.oldPassword) {
                                        var docPwd = userData.mail.oldPassword;
                                    } else {
                                        docPwd = userData.mail.currentPassword;
                                    }

                                    if (userPwd == userData.mail.oldPassword) {
                                        var mailObj   = {
                                            mail           : mail,
                                            oldPassword    : docPwd,
                                            newPassword    : docPwd,
                                            currentPassword: docPwd

                                        };
                                        userData.mail = mailObj;

                                        Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                            if (!err) {
                                                result.id = userData.id;
                                                updateUserDocumentCommon(result, function (err, res) {
                                                    if (!err) {
                                                        return innerCb();
                                                    } else {
                                                        return innerCb(err);
                                                    }
                                                })
                                            }
                                        })
                                    } else if (userPwd == docPwd) {
                                        return innerCb();
                                    } else {
                                        return innerCb(MSG_CODE.RES_INVALID_PASSWORD);
                                    }
                                } else {
                                    password      = Utils.encryptString(password);
                                    var mailObj   = {
                                        mail           : mail,
                                        oldPassword    : password,
                                        newPassword    : password,
                                        currentPassword: password

                                    };
                                    userData.mail = mailObj;
                                    Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                        if (!err) {
                                            result.id = userData.id;
                                            updateUserDocumentCommon(result, function (err, res) {
                                                if (!err) {
                                                    return innerCb();
                                                } else {
                                                    return innerCb(err);
                                                }
                                            })
                                        }
                                    })
                                }
                                // return innerCb();
                            } else {
                                if (!err) {
                                    err = MSG_CODE.RES_INVALID_USERID
                                }
                                return innerCb(err);
                            }
                        })
                    }

                ],
                function (err, res) {
                    if (!err) {
                        return outerCb(null, userData, false);
                    } else {
                        return outerCb(err);
                    }
                }
            );
        }
    })

    async.waterfall(tasks, function (err, result) {
        if (!err) {
            console.log("Result", result)
            return callback(null, userData, false);
        } else {
            console.log("Error")
            return callback(err);
        }
    })

}

/**
 * sendVerify Email
 * @param userData
 */
function sendVerifyEmail(userData) {

    var templateObj = {
        name      : userData.name ? userData.name.firstName : '',
        verifyCode: userData.verifyCode
    };

    var mailBody = MAIL_TEMPLATE.registerEmail(templateObj);
    var to       = {
        name   : userData.name ? userData.name.firstName : null,
        address: userData.mail.mail
    };

    var mailObject = {
        isHtml : true,
        to     : [to],
        subject: 'HomeBuzz : Verify Email',
        body   : mailBody
    };

    var clientMailRequest = {
        auth   : null,
        payload: mailObject
    };

    mailerService.sendMail(clientMailRequest, function (err, response) {
        console.log('Mail Response ', err, response);
    });
}

/**
 * createEmail User
 * @param payload
 * @param callback
 */
function createEmailUser(payload, MSG_CODE, callback) {
    var task                = [];
    var userData, isNewUser = false;

    task.push(function (innerCb) {
        payload.id       = payload.mail.mail;
        payload.regEmail = payload.mail.mail;
        payload.status   = 'INACTIVE';
        payload.isActive = false;
        isNewUser        = true;
        userService.createUserId(function (err, res) {
            if (err) {
                console.log('ERROR WHILE GENERATING USERID ', err);
                return innerCb(err);
            } else {
                payload.userId = res;
                return innerCb();
            }
        });
    });

    task.push(function (innerCb) {
        createEmailDocument(payload, MSG_CODE, innerCb);
    });

    task.push(function (innerCb) {
        payload.mail.password = Utils.encryptString(payload.mail.password);
        var userDoc           = Utils.cloneObject(payload);
        userDoc.verifyCode    = Utils.getRandomNumber(5);
        console.log('6. USER DOC ', JSON.stringify(userDoc));
        getUpdatePayloadData(userDoc, payload, function (err, result) {
            if (!err) {
                userDoc = result;
                createUserDocument(userDoc, MSG_CODE, function (err, result) {
                    if (!err) {
                        userData = userDoc;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            } else {
                return innerCb(err);
            }
        })
    });

    async.series(task, function (err, result) {
        if (!err) {
            sendVerifyEmail(userData);
            userData.status = 'INACTIVE';
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * signInBy Twitter
 * @param payload
 * @param callback
 */
function signInByTwitter(payload, MSG_CODE, callback) {
    var twitter             = payload.twitter;
    var userData, isNewUser = false;

    async.waterfall([
        function (innerCb) {
            getTwitterDocument(twitter.twitterId, function (err, res) {
                if (!err && res.length > 0) {
                    innerCb(null, res);
                } else {
                    innerCb(null, null);
                }
            });
        },
        function (twitterDoc, innerCb) {
            if (twitterDoc != null && twitterDoc.length > 0) {
                var twitterData = twitterDoc[0][bucketName];
                var userId      = twitterData.userId;
                getUserDocument(userId, function (err, result) {
                    if (!err && result.length > 0) {
                        userData = result[0][bucketName];
                        getUpdatePayloadData(userData, payload, function (err, result) {
                            if (!err) {
                                userData = result;
                                Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                    if (!err) {
                                        result.id = userData.id;
                                        updateUserDocumentCommon(result, function (err, res) {
                                            if (!err) {
                                                return innerCb();
                                            } else {
                                                return innerCb(err);
                                            }
                                        })
                                    }
                                })
                            } else {
                                return innerCb(err)
                            }
                        })
                    } else {
                        return innerCb(MSG_CODE.RES_USER_NOT_EXISTS);
                    }
                });
            } else {
                createTwitterUser(payload, MSG_CODE, function (err, result, newUser) {
                    if (!err) {
                        userData  = result;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            }
        }
    ], function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * create TwitterUser
 * @param payload
 * @param callback
 */
function createTwitterUser(payload, MSG_CODE, callback) {
    var task;
    var userData, isNewUser = false;
    console.log(payload);

    if (payload.twitter.mail) {
        task = [];
        var userId;

        task.push(function (innerCb) {
            if (!userId) {
                getEmailDocument(payload.twitter.mail, function (err, result) {
                    if (!err && result.length > 0) {
                        userId = result[0][bucketName].userId;
                    }
                    return innerCb();
                });
            } else {
                return innerCb();
            }
        });

        task.push(function (innerCb) {
            if (userId) {

                getUserDocument(userId, function (err, result) {
                    if (!err && result.length > 0) {
                        var userDoc = result[0][bucketName];
                        if (!userDoc.twitter || (userDoc.twitter && userDoc.twitter.twitterId == payload.twitter.twitterId)) {
                            payload.userId = userId;
                            payload.id     = payload.twitter.twitterId;
                            payload.status = 'VERIFIED';

                            createTwitterDocument(payload, MSG_CODE, function (err, res) {
                                if (!err) {
                                    userData = result.value;
                                    getUpdatePayloadData(userDoc, payload, function (err, result) {
                                        if (!err) {
                                            userDoc = result;
                                            Utils.N1qlUpdateQueryFormation(userDoc, function (err, result) {
                                                if (!err) {
                                                    result.id = userDoc.id;
                                                    updateUserDocumentCommon(result, function (err, res) {
                                                        if (!err) {
                                                            return innerCb();
                                                        } else {
                                                            return innerCb(err);
                                                        }
                                                    })
                                                }
                                            })
                                        } else {
                                            return innerCb(err);
                                        }
                                    })
                                } else {
                                    return innerCb(err);
                                }
                            });
                        } else {
//Create Fresh User without that mail id. because that mail id already mapped with other fb account.
                            isNewUser = true;
                            userService.createUserId(function (err, res) {
                                if (err) {
                                    console.log('ERROR WHILE GENERATING USERID ', err);
                                    return innerCb(err);
                                } else {
                                    payload.userId = res;
                                    payload.id     = payload.twitter.twitterId;
                                    payload.status = 'VERIFIED';
                                    delete payload.twitter.mail;

                                    console.log('came here ***');

                                    createTwitterDocument(payload, MSG_CODE, function (err, res) {
                                        if (!err) {
                                            var userDoc = Utils.cloneObject(payload);
                                            createUserDocument(userDoc, function (err, result) {
                                                if (!err) {
                                                    userData = result;
                                                    return innerCb();
                                                } else {
                                                    return innerCb(err);
                                                }
                                            });
                                        } else {
                                            return innerCb(err);
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        return innerCb(err);
                    }
                });
            } else {
                isNewUser = true;
                userService.createUserId(function (err, res) {
                    if (err) {
                        console.log('ERROR WHILE GENERATING USERID ', err);
                        return innerCb(err);
                    } else {
                        payload.userId   = res;
                        payload.id       = payload.twitter.twitterId;
                        payload.status   = 'VERIFIED';
                        payload.regEmail = payload.twitter.mail;

                        createTwitterDocument(payload, MSG_CODE, function (err, res) {
                            if (!err) {
                                var userDoc = Utils.cloneObject(payload);
                                createUserDocument(userDoc, MSG_CODE, function (err, result) {
                                    if (!err) {
                                        userData     = result;
                                        payload.mail = {
                                            mail: payload.twitter.mail
                                        };
                                        createEmailDocument(payload, MSG_CODE, innerCb);
                                    } else {
                                        console.log(err);
                                        return innerCb(err);
                                    }
                                });
                            } else {
                                return innerCb(err);
                            }
                        });
                    }
                });
            }
        });
    } else {
        payload.id     = payload.twitter.twitterId;
        payload.status = 'VERIFIED';
        task           = [];
        isNewUser      = true;
        task.push(function (innerCb) {
            userService.createUserId(function (err, res) {
                if (err) {
                    console.log('ERROR WHILE GENERATING USERID ', err);
                    return innerCb(err);
                } else {
                    payload.userId = res;
                    return innerCb();
                }
            });
        });

        task.push(function (innerCb) {
            createTwitterDocument(payload, MSG_CODE, innerCb);
        });

        task.push(function (innerCb) {
            var userDoc = Utils.cloneObject(payload);
            createUserDocument(userDoc, MSG_CODE, function (err, result) {
                if (!err) {
                    userData = result;
                    return innerCb();
                } else {
                    return innerCb(err);
                }
            });
        });
    }

    async.series(task, function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * signInBy LinkedIn
 * @param payload
 * @param callback
 */
function signInByLinkedIn(payload, MSG_CODE, callback) {
    var linkedIn            = payload.linkedIn;
    var userData, isNewUser = false;

    async.waterfall([
        function (innerCb) {
            getLinkedInDocument(linkedIn.linkedInId, function (err, res) {
                if (!err && res.length > 0) {
                    var linkedInDoc = res[0][bucketName];
                    innerCb(null, res);
                } else {
                    innerCb(null, null);
                }
            });
        },
        function (linkedInDoc, innerCb) {
            if (linkedInDoc != null && linkedInDoc.length > 0) {
                var linkedInData = linkedInDoc[0][bucketName];
                var userId       = linkedInData.userId;
                getUserDocument(userId, function (err, userDoc) {
                    if (!err && userDoc.length >= 0) {
                        userData          = userDoc[0][bucketName];
                        userData.linkedIn = linkedIn;
                        getUpdatePayloadData(userData, payload, function (err, result) {
                            if (!err) {
                                userData = result;
                                Utils.N1qlUpdateQueryFormation(userData, function (err, result) {
                                    if (!err) {
                                        result.id = userData.id;
                                        updateUserDocumentCommon(result, function (err, res) {
                                            if (!err) {
                                                return innerCb();
                                            } else {
                                                return innerCb(err);
                                            }
                                        })
                                    }
                                })
                            } else {

                            }
                        })
                    } else {
                        console.log(MSG_CODE.RES_USER_NOT_EXISTS)
                        return innerCb(MSG_CODE.RES_USER_NOT_EXISTS);
                    }
                })


            } else {
                createLinkedInUser(payload, MSG_CODE, function (err, result, newUser) {
                    if (!err) {
                        console.log("no err");
                        userData  = result;
                        isNewUser = newUser;
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                });
            }
        }
    ], function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * create LinkedInUser
 * @param payload
 * @param callback
 */
function createLinkedInUser(payload, MSG_CODE, callback) {
    var task;
    var userData, isNewUser = false;
    console.log(payload);
    var linkedInId          = payload.linkedIn.linkedInId;
    var mailId              = payload.linkedIn.mail;

    if (linkedInId) {
        task = [];
        var userId;

        task.push(function (innerCb) {
            getEmailDocument(mailId, function (err, result) {
                if (!err && result.length > 0) {
                    userId = result[0][bucketName].userId;
                    return innerCb()
                } else {
                    return innerCb(err);
                }
            });
        });

        task.push(function (innerCb) {
            if (userId) {
                getUserDocument(userId, function (err, result) {
                    if (!err && result.length > 0) {
                        var userDoc = result[0][bucketName];
                        if (!userDoc.linkedIn || (userDoc.linkedIn && userDoc.linkedIn.linkedInId == payload.linkedIn.linkedInId)) {
                            payload.userId = userId;
                            payload.id     = payload.linkedIn.linkedInId;
                            payload.status = 'ACTIVE';

                            createLinkedInDocument(payload, MSG_CODE, function (err, res) {
                                if (!err) {
                                    userData        = userDoc;
                                    userData.status = "ACTIVE";

                                    Utils.N1qlUpdateQueryFormation(userDoc, function (err, result) {
                                        if (!err) {
                                            result.id = userData.id;
                                            updateUserDocumentCommon(result, function (err, res) {
                                                if (!err) {
                                                    return innerCb();
                                                } else {
                                                    return innerCb(err);
                                                }
                                            })
                                        } else {
                                            return innerCb(err);
                                        }
                                    })

                                } else {
                                    return innerCb(err);
                                }
                            });
                        } else {
//Create Fresh User without that mail id. because that mail id already mapped with other fb account.
                            isNewUser = true;
                            userService.createUserId(function (err, res) {
                                if (err) {
                                    console.log('ERROR WHILE GENERATING USERID ', err);
                                    return innerCb(err);
                                } else {
                                    payload.userId = res;
                                    payload.id     = payload.linkedIn.linkedInId;
                                    payload.status = 'VERIFIED';
                                    delete payload.linkedIn.mail;

                                    createLinkedInDocument(payload, MSG_CODE, function (err, res) {
                                        if (!err) {
                                            var userDoc = Utils.cloneObject(payload);
                                            createUserDocument(userDoc, MSG_CODE, function (err, result) {
                                                if (!err) {
                                                    userData = result;
                                                    return innerCb();
                                                } else {
                                                    return innerCb(err);
                                                }
                                            });
                                        } else {
                                            return innerCb(err);
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        return innerCb(err);
                    }
                });
            } else {
                isNewUser = true;
                userService.createUserId(function (err, res) {
                    if (err) {
                        console.log('ERROR WHILE GENERATING USERID ', err);
                        return innerCb(err);
                    } else {
                        payload.userId   = res;
                        payload.id       = payload.linkedIn.linkedInId;
                        payload.status   = 'VERIFIED';
                        payload.regEmail = payload.linkedIn.mail;

                        createLinkedInDocument(payload, MSG_CODE, function (err, res) {
                            if (!err) {
                                var userDoc = Utils.cloneObject(payload);
                                createUserDocument(userDoc, MSG_CODE, function (err, result) {
                                    if (!err) {
                                        userData     = result;
                                        payload.mail = {
                                            mail: payload.linkedIn.mail
                                        };
                                        createEmailDocument(payload, MSG_CODE, innerCb);
                                    } else {
                                        console.log(err);
                                        return innerCb(err);
                                    }
                                });
                            } else {
                                return innerCb(err);
                            }
                        });
                    }
                });
            }
        });
    } else {
        payload.id     = payload.linkedIn.linkedInId;
        payload.status = 'VERIFIED';
        task           = [];
        isNewUser      = true;
        task.push(function (innerCb) {
            userService.createUserId(function (err, res) {
                if (err) {
                    console.log('ERROR WHILE GENERATING USERID ', err);
                    return innerCb(err);
                } else {
                    payload.userId = res;
                    return innerCb();
                }
            });
        });

        task.push(function (innerCb) {
            createLinkedInDocument(payload, MSG_CODE, innerCb);
        });

        task.push(function (innerCb) {
            var userDoc = Utils.cloneObject(payload);
            createUserDocument(userDoc, MSG_CODE, function (err, result) {
                if (!err) {
                    userData = result;
                    return innerCb();
                } else {
                    return innerCb(err);
                }
            });
        });
    }

    async.series(task, function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * signInBy Mobile
 * @param payload
 * @param callback
 */
function signInByMobile(payload, callback) {
    var mobile              = payload.mobile;
    var userData, isNewUser = false;
    async.waterfall([
        function (innerCb) {
            getMobileDoc(mobile.number, function (err, res) {
                if (!err && res.length > 0) {
                    var mobileDoc = res[0][bucketName];
                    return innerCb(null, mobileDoc);
                } else {
                    return innerCb(null, null);
                }
            });
        },
        function (mobileDoc, innerCb) {
            if (mobileDoc && mobileDoc == null) {
                createMobileUser(payload, function (err, res) {
                    return innerCb();
                })
            } else {
                getUserDocument(mobileDoc.userId, function (err, res) {
                    if (!err && res.length > 0) {
                        userData        = res[0][bucketName];
                        userData.mobile = {
                            number: mobileDoc.id
                        }
                        return innerCb();
                    } else {
                        return innerCb(err);
                    }
                })

            }
        }
    ], function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * create MobileUser
 * @param payload
 * @param callback
 */
function createMobileUser(payload, callback) {
    var task                = [];
    var userData, isNewUser = false;
    payload.id              = payload.mobile.mobile;
    payload.regMobile       = payload.mobile.mobile;

    task.push(function (innerCb) {
        isNewUser = true;
        userService.createUserId(function (err, res) {
            if (err) {
                console.log('ERROR WHILE GENERATING USERID ', err);
                return innerCb(err);
            } else {
                payload.userId = res;
                return innerCb();
            }
        });

    });

    task.push(function (innerCb) {
        createMobileDocument(payload, function (err, res) {
            return innerCb();
        });
    });

    task.push(function (innerCb) {
        var userDoc = Utils.cloneObject(payload);
        createUserDocument(userDoc, function (err, result) {
            if (!err) {
                userData = userDoc;
                return innerCb(null, userDoc);
            } else {
                return innerCb(err);
            }
        });
    });

    async.series(task, function (err, result) {
        if (!err) {
            return callback(null, userData, isNewUser);
        } else {
            return callback(err);
        }
    });
}

/**
 * Create Auth Document
 *
 * @param payload - required
 * @param callback - required
 */
function createAuthDocument(payload, MSG_CODE, callback) {

    var authObj = {
        type       : "authentication",
        id         : payload.authorization,
        userId     : payload.userId,
        mode       : payload.device.mode,
        deviceId   : payload.device.deviceId,
        loginMode  : payload.loginMode,
        accountMode: payload.accountMode,
        loginType  : payload.loginType,
        location   : payload.location,
        otp        : payload.otp,
        cDate      : moment().toISOString(),
        updatedDate: moment().toISOString()
    };

    //console.log("vijay")
    validateData(authObj, AUTH_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.AUTH + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTAUTH, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    if (!err) {
                        return callback();
                    } else {
                        return callback(err)
                    }
                });
            });
        } else {
            return callback(err);
        }
    });
};

function getTwitterDocument(req, callback) {
    var insertKey    = '"' + dbKeys.TWITTER + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTTWITTERDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            if (!err) {
                callback(null, result);
            } else {
                callback();
            }
        });
    });
}

/**
 * get Auth Document
 *
 * @param payload - required
 * @param callback - required
 */
function getAuthDocument(req, callback) {
    var insertKey    = '"' + dbKeys.AUTH + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTAUTHDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            if (!err) {
                console.log("at Auth - >", result)
                var fbDoc = result;
                callback(null, fbDoc)
            } else {
                callback();
            }
        });
    });
}

function getFbDocument(req, callback) {
    var insertKey    = '"' + dbKeys.FB + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTFBDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log("Query Result", resData)
            if (!err) {
                console.log("at fbDoc - >", result)
                var fbDoc = result;
                callback(null, fbDoc)
            } else {
                callback();
            }
        });
    });
}

function getGplusDocument(req, callback) {
    var insertKey    = '"' + dbKeys.GPLUS + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTGPLUSDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            if (!err) {
                return callback(null, result);
            } else {
                return callback(null, null)
            }
        });
    });
}

function getEmailDocument(req, callback) {
    var insertKey    = '"' + dbKeys.EMAIL + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTEMAILDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log("FaceBook Mail Document", resData)
            if (!err) {
                var mailDoc = result;
                return callback(null, mailDoc);
            } else {
                return callback(err)
            }
        });
    });
}

function getUserEmailDocument(request, callback) {
    var insertKey    = '"' + dbKeys.EMAIL + request + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTEMAILDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log("FaceBook Mail Document", resData)
            if (!err) {
                var mailDoc = result;
                return callback(null, mailDoc);
            } else {
                return callback(err)
            }
        });
    });
}

function getUserDocument(req, callback) {
    var insertKey    = '"' + dbKeys.USER + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTUSERDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log("Query", resData)
            if (!err) {
                return callback(null, result)
            } else {
                return callback(err)
            }
        });
    });
}

function upsertUserDocument(req, MSG_CODE, callback) {
    console.log("upsertUserDocument", req)
    validateData(req, USER_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.USER + req.id + '",' + JSON.stringify(req);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.UPSERTUSERDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                if (!err) {
                    return callback(null, result);
                } else {
                    return callback(err);
                }
            });
        });
    })
}

function updateUserDoc(req, callback) {
    var insertKey    = '"' + dbKeys.USER + req.userId + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey,
        updateKey : req.updateKey,
        data      : req.data
    };

    commonService.queryBuilder(constantQuery.UPDATEUSER, req, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log("Query Update User Doc", resData)
            return callback();
        });
    });
}

function updateUserDocumentCommon(request, callback) {
    var docId        = request.id;
    var data         = request.queryData;
    var query        = request.query + ' RETURNING *';
    var insertKey    = '"' + dbKeys.USER + docId + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    var response     = _.extend(data, reqObjParams);
    commonService.queryBuilder(query, response, function (resData, resValue) {
        console.log("queryBuilder", resData)
        commonService.query(resData, resValue, function (err, result) {
            if (!err) {
                return callback();
            } else {
                return callback(err);
            }
        });
    });
}


function updateUserDoc2(req, callback) {
    var insertKey    = '"' + dbKeys.USER + req.userId + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey,
        updateKey : req.updateKey,
        data      : req.data,
        updateKey2: req.updateKey2,
        data2     : req.data2
    };
    commonService.queryBuilder(constantQuery.UPDATEUSER2, req, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            callback();
        });
    });
}

function updateSessionDoc2(req, callback) {
    var insertKey    = '"' + dbKeys.SESSION + req.id + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey,
        updateKey : req.updateKey,
        data      : req.data,
        updateKey2: req.updateKey2,
        data2     : req.data2
    };
    commonService.queryBuilder(constantQuery.SESSIONUSER2, req, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            callback();
        });
    });
}

function getDeviceDataDocument(req, callback) {
    var insertKey    = '"' + dbKeys.DEVICEDATA + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTDEVICEDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log(result)
            callback(null, result);
        });
    });
}

/**
 * getDeviceDocument
 * @param req
 * @param callback
 */
function getDeviceDocument(req, callback) {
    var insertKey    = '"' + dbKeys.DEVICE + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTDEVICEDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log(result)
            callback(null, result);
        });
    });
}

function createLinkedInDocument(payload, MSG_CODE, callback) {
    var doc = {
        type       : "linkedIn",
        id         : payload.linkedIn.linkedInId,
        userId     : payload.userId,
        cDate      : moment().toISOString(),
        updatedDate: moment().toISOString()
    };
    validateData(doc, LINKEDIN_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.LINKEDIN + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTLINKEDINDOC, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    callback();
                });
            });
        } else {
            return callback(err, null);
        }
    });
};

function createTwitterDocument(payload, MSG_CODE, callback) {
    var doc = {
        type  : "twitter",
        id    : payload.twitter.twitterId,
        userId: payload.userId,
        cDate : moment().toISOString(),
        uDate : moment().toISOString()
    };
    validateData(doc, TWITTER_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.TWITTER + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTLINKEDINDOC, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    callback(null, doc);
                });
            });
        } else {
            return callback(err, null);
        }
    });

};

function createDeviceDataDocument(req, MSG_CODE, callback) {
    validateData(req, DEVCIE_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.DEVICE_INFO + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTDEVICEDOC, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    callback();
                });
            });
        } else {
            return callback(err, null);
        }
    });
}

function deviceDataDocument(payload, MSG_CODE, callback) {
    var device      = payload.device;
    var deviceId    = device.deviceId;
    var deviceToken = device.deviceToken;
    var deviceType  = device.mode;
    var id          = deviceType + ':' + deviceId;

    var deviceObj = {
        type       : "device",
        deviceType : deviceType,
        id         : id,
        deviceId   : deviceId,
        deviceToken: deviceToken,
        cDate      : moment().toISOString()
    };
    getDeviceDataDocument(id, function (err, res) {
        if (!err) {
            if (!res.length) {
                createDeviceDataDocument(deviceObj, MSG_CODE, function (err, res) {
                    return callback();
                })
            } else {
                return callback();
            }
        } else {
            return callback(err, null)
        }
    })
}

/**
 * Create / Update the User Device Document
 * DeviceId & deviceToken will be mapped with users deviceType
 *
 * @param payload
 * @param callback
 */
function createUserDeviceDocument(req, MSG_CODE, callback) {
    validateData(req, USER_DEV_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.USER_DEV + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTUSERDEVDOC, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    if (!err) {
                        return callback();
                    } else {
                        return callback(err)
                    }
                });
            });
        } else {
            return callback();
        }
    })

}

function upsertUserDevDocument(req, MSG_CODE, callback) {
    validateData(req.data, USER_DEV_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.USER_DEV + req.id + '",' + JSON.stringify(validData);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.UPSERTUSERDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                callback();
            });
        });
    });
}

function upsertDevDocument(req, MSG_CODE, callback) {
    validateData(req, DEVCIE_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.DEVICE + validData.id + '",' + JSON.stringify(validData);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.UPSERTDEVDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                callback();
            });
        });
    });
}

function getUserDevDocument(req, callback) {
    var insertKey    = '"' + dbKeys.USER_DEV + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTUSERDEVDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            callback(null, result);
        });
    });
}

function persistUserDeviceDocument(payload, callback) {

    var device      = payload.device;
    var deviceId    = device.deviceId;
    var deviceToken = device.deviceToken;
    var deviceType  = device.mode;
    var deviceObj   = {
        deviceId   : deviceId,
        deviceToken: deviceToken
    };
    if (device.model) {
        deviceObj.model = device.model;
    }
    if (device.version) {
        deviceObj.version = device.version;
    }
    if (device.OS) {
        deviceObj.OS = device.OS;
    }

    getUserDevDocument(payload.userId, function (err, res) {
        if (!err) {
            if (res.length > 0) {
                var devDoc = res[0][bucketName]
                if (!devDoc.tokens[deviceType]) {
                    devDoc.tokens[deviceType] = {};
                }

                devDoc.tokens[deviceType][deviceId] = deviceObj;
                devDoc.updatedDate                  = moment().toISOString();
                var req                             = {
                    id  : payload.userId,
                    data: devDoc
                };
                upsertUserDevDocument(req, function (err, res) {
                    return callback();
                })
            } else {
                var devObj = {
                    type       : "device_info",
                    id         : payload.userId,
                    deviceToken: device.deviceToken,
                    cDate      : moment().toISOString(),
                    updatedDate: moment().toISOString(),
                    tokens     : {}
                };

                devObj.tokens[deviceType]           = {};
                devObj.tokens[deviceType][deviceId] = deviceObj;

                createUserDeviceDocument(devObj, function (err, res) {
                    return callback();
                })
            }
        } else {
            return callback();
        }
    })
};

function createDeviceDocument(req, MSG_CODE, callback) {
    validateData(req, DEVCIE_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.DEVICE + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTDEVICEDOC, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    if (!err) {
                        return callback();
                    } else {
                        return callback(err)
                    }
                });
            });
        } else {
            return callback();
        }
    })
}

/**
 * Create / Update the Device Document
 * UserId will be mapped with device Document & oldUser will be removed (in respective userDevice Document too)
 *
 * @param payload
 * @param callback
 */

function persistDeviceDocument(payload, RESP_MSG, callback) {

    var device = payload.device;

    var deviceId    = device.deviceId;
    var deviceToken = device.deviceToken;
    var deviceType  = device.mode;
    var model       = device.model;
    var version     = device.version;
    var id          = deviceType + ':' + deviceId;

    var devObj = {
        type       : "device",
        deviceType : deviceType,
        id         : id,
        userId     : payload.id,
        deviceId   : deviceId,
        deviceToken: deviceToken,
        model      : model,
        version    : version,
        cDate      : moment().toISOString(),
        uDate      : moment().toISOString()
    };

    if (device.model) {
        devObj.model = device.model;
    }
    if (device.version) {
        devObj.version = device.version;
    }
    if (device.OS) {
        devObj.OS = device.OS;
    }
    getDeviceDocument(id, function (err, res) {
        if (!err) {
            if (res.length > 0) {
                var devData  = res[0][bucketName];
                devObj.cDate = devData.cDate;
                upsertDevDocument(devObj, RESP_MSG, function (err, res) {
                    return callback();
                })
            } else {
                devObj.cDate = moment().toISOString();
                createDeviceDocument(devObj, RESP_MSG, function (err, res) {
                    if (!err) {
                        return callback();
                    } else {
                        return callback();
                    }
                })
            }
        } else {
            return callback();
        }
    })
};

function createFBDocument(payload, MSG_CODE, callback) {
    var doc = {
        type       : "facebook",
        id         : payload.facebook.fbId,
        userId     : payload.userId,
        cDate      : moment().toISOString(),
        updatedDate: moment().toISOString()
    };
    validateData(doc, FB_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        if (!err) {
            var insertKey    = '"' + dbKeys.FB + validData.id + '",' + JSON.stringify(validData);
            var reqObjParams = {
                bucketName: bucketName,
                key       : insertKey
            };
            commonService.queryBuilder(constantQuery.INSERTFBDOC, reqObjParams, function (resData, resValue) {
                commonService.query(resData, resValue, function (err, result) {
                    if (!err) {
                        return callback(null, result);
                    } else {
                        return callback(err)
                    }
                });
            });
        } else {
            return callback(err, null)
        }
    });
};

function createGPlusDocument(payload, MSG_CODE, callback) {
    var doc = {
        type  : "gplus",
        id    : payload.gplus.gmail,
        userId: payload.userId,
        cDate : moment().toISOString(),
        uDate : moment().toISOString()
    };
    validateData(doc, GPLUS_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        console.log("++++++++", validData)
        var insertKey    = '"' + dbKeys.GPLUS + validData.id + '",' + JSON.stringify(validData);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.INSERTGPLUS, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                if (!err) {
                    return callback(null, result);
                } else {
                    return callback(err)
                }
            });
        });
    });
};

function createEmailDocument(payload, MSG_CODE, callback) {
    var mailId = payload.mail.mail.toLowerCase();
    var doc    = {
        type       : "email",
        id         : mailId,
        userId     : payload.userId,
        isActive   : !payload.isActive,
        cDate      : moment().toISOString(),
        updatedDate: moment().toISOString()
    }
    validateData(doc, EMAIL_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.EMAIL + doc.id + '",' + JSON.stringify(doc);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.INSERTEMAILDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                if (!err) {
                    return callback(null, doc);
                } else {
                    return callback(err, null)
                }
            });
        });
    });
};

/**
 * create mobile Document
 * @param payload
 * @param {Response Messages} MSG_CODE
 * @param callback
 */
function createMobileDocument(payload, MSG_CODE, callback) {
    var doc = {
        type       : "mobile",
        id         : payload.mobile.number,
        userId     : payload.userId,
        cDate      : moment().toISOString(),
        updatedDate: moment().toISOString(),
        isActive   : false
    };
    validateData(doc, MOBILE_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.MOBILE + validData.id + '",' + JSON.stringify(validData);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.INSERTMOBILEDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                console.log(result)
                callback(null, result);
            });
        });
    });
};

function getMobileDoc(req, callback) {
    var insertKey    = '"' + dbKeys.MOBILE + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTMOBILEDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log(result)
            callback(null, result);
        });
    });
};

/**
 * Create User Document
 *
 * @param payload - required
 * @param callback - required
 */
function createUserDocument(payload, MSG_CODE, callback) {
    payload.type        = "user";
    payload.cDate       = moment().toISOString();
    payload.updatedDate = moment().toISOString();
    payload.id          = payload.userId;
    payload.status      = 'INACTIVE';
    validateData(payload, USER_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.USER + payload.userId + '",' + JSON.stringify(validData);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.INSERTUSERDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                if (!err) {
                    return callback(null, payload);
                } else {
                    return callback(err, null)
                }
            });
        });
    });
};

/**
 * updateAuth Document
 * @param req
 * @param callback
 */
function updateAuthDocument(req, callback) {
    var insertKey    = '"' + dbKeys.AUTH + req.id + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey,
        updateKey : req.updateKey,
        data      : req.data
    };
    commonService.queryBuilder(constantQuery.UPDATEAUTH, req, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            callback();
        });
    });
}

function getLinkedInDocument(request, callback) {
    var insertKey    = '"' + dbKeys.LINKEDIN + request + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.SELECTLINKEDINDOC, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            if (!err) {
                return callback(null, result);
            } else {
                return callback(err)
            }
        });
    });
}

/**
 * otp verification
 * */
user.verifyOtp = function (request, callback) {
    var auth          = request.auth;
    var payload       = request.payload;
    var apiId         = request.apiId;
    var moduleId      = request.moduleId;
    var MSG_CODE      = RESP_MSG[moduleId][apiId];
    var authorization = auth.id;
    var tasks         = [];
    var otp;

    tasks.push(function (innerCb) {
        if (auth.otp) {
            otp = auth.otp.code;
            if (otp == payload.code) {
                return innerCb();
            }
            else {
                return innerCb(MSG_CODE.RES_INVALID_CODE);
            }
        } else {
            return innerCb(MSG_CODE.RES_CANT_VERIFY_OTP)
        }
    });

    tasks.push(function (innerCb) {
        var data = {
            "otp.verified": true,
            "otp.date"    : moment().toISOString()
        };

        Utils.N1qlUpdateQueryFormation(data, function (err, result) {
            result.id   = authorization;
            result.type = auth.type;
            updateDocument(result, function (err, res) { // update Otp status (verified) after verification
                if (!err) {
                    return innerCb(null, res);
                } else {
                    return innerCb(err);
                }
            })
        })
    });

    async.waterfall(tasks, function (err, result) {
        if (!err) {
            return callback(null, MSG_CODE.RES_SUCCESS);
        } else {
            console.log("Error");
            return callback(err);
        }
    });

}

/**
 * Reset Password
 *
 * @param reqObj - required
 * @param callback - required
 */
user.resetPassword = function (reqObj, callback) {
    var params       = reqObj.params;
    var apiId        = reqObj.apiId;
    var moduleId     = reqObj.moduleId;
    var MSG_CODE     = RESP_MSG[moduleId][apiId];
    var emailId      = params.email.toLowerCase();
    var insertKey    = '"' + dbKeys.EMAIL + +'"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    getEmailDocument(emailId, function (err, res) {
        if (!err && res.length > 0) {
            var mailDoc      = res[0][bucketName];
            mailDoc.isActive = true
            if (mailDoc.isActive) {
                var userId         = mailDoc.userId;
                var newPassword    = Utils.generateRandomString(8);
                var forgotPassword = {
                    password: Utils.encryptString(newPassword),
                    date    : moment().toISOString()
                }
                var insertKey      = '"' + dbKeys.USER + userId + '"';
                var req            = {
                    bucketName: bucketName,
                    key       : insertKey,
                    updateKey : 'forgotPassword',
                    data      : JSON.stringify(forgotPassword)
                }
                updateUserDoc(req, function (err, res) {
                    if (!err) {
                        /*var templateObj = {
                         name: userData.name ? userData.name.firstName : '',
                         email: userData.mail.mail,
                         password: newPassword
                         };

                         var mailBody = MAIL_TEMPLATE.resetPassword(templateObj);
                         var to = {
                         name: userData.name ? userData.name.firstName : null,
                         address: userData.mail.mail
                         };
                         var mailObject = {
                         isHtml: true,
                         to: [to],
                         subject: 'HomeBuzz : Reset Password',
                         body: mailBody
                         };

                         var clientMailRequest = {
                         auth: reqObj.auth,
                         payload: mailObject
                         };

                         mailerService.sendMail(clientMailRequest, function (err, response) {
                         console.log('Mail Response ', err, response);
                         });*/
                        return callback(null, MSG_CODE.RES_SUCCESS);
                    } else {
                        return callback();
                    }
                })

            } else {
                return callback(MSG_CODE.RES_ACC_NOT_VERIFIED);
            }
        } else {
            if (!err) {
                return callback(MSG_CODE.RES_MAIL_NOT_EXISTS);
            } else {
                return callback(err);
            }
        }
    })
};

/**
 * Change Password
 *
 * @param reqObj
 * @param callback
 */
user.changePasswordUser = function (reqObj, callback) {
    var apiId           = reqObj.apiId;
    var moduleId        = reqObj.moduleId;
    var payload         = reqObj.payload;
    var auth            = reqObj.auth;
    var userId          = auth.userId;
    var MSG_CODE        = RESP_MSG[moduleId][apiId];
    var newPassword     = payload.newPassword;
    var oldPassword     = payload.oldPassword;
    var confirmPassword = payload.confirmPassword;
    var userDoc;
    console.log("Payload", payload.oldPassword)
    async.series([
        function (innerCb) {
            getUserDocument(userId, function (err, resUserDoc) {
                if (!err && resUserDoc.length > 0) {
                    userDoc = resUserDoc[0][bucketName];
                    return innerCb();
                } else {
                    if (!err) {
                        err = MSG_CODE.RES_INVALID_USERID
                    }
                    return innerCb(err);
                }
            })
        },
        function (innerCb) {
            oldPassword     = Utils.encryptString(oldPassword)
            newPassword     = Utils.encryptString(newPassword)
            confirmPassword = Utils.encryptString(confirmPassword)
            if (userDoc.mail) {
                var mailId = userDoc.mail.mail.toLowerCase();
                var oldPwd = userDoc.mail.oldPassword;
                if (oldPwd == oldPassword) {
                    if (newPassword == confirmPassword) {
                        var mailObj      = {
                            mail           : mailId,
                            oldPassword    : newPassword,
                            newPassword    : newPassword,
                            currentPassword: newPassword
                        };
                        var insertKey    = '"' + dbKeys.USER + userId + '"';
                        console.log(userId)
                        var reqObjParams = {
                            bucketName: bucketName,
                            key       : insertKey,
                            updateKey : 'mail',
                            data      : JSON.stringify(mailObj)
                        };
                        //console.log("reqObjParams",reqObjParams)

                        updateUserDoc(reqObjParams, function (err, res) {
                            if (!err) {
                                innerCb(null, res);
                            } else {
                                innerCb(err);
                            }
                        })
                    } else {
                        return innerCb(MSG_CODE.RES_PASSWORD_NOT_MATCH);
                    }
                } else {
                    console.log("Invalid Current Password")
                    return innerCb(MSG_CODE.RES_AUTH_FAILED);
                }
            } else {
                return innerCb(MSG_CODE.RES_AUTH_FAILED);
            }
        }
    ], function (err, res) {
        if (!err) {
            return callback(null, MSG_CODE.RES_SUCCESS);
        } else {
            return callback(err);
        }
    });
};


//resend OTP

user.resendOTP = function (reqObj, callback) {
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];
    var payload  = reqObj.payload;
    var cCode    = payload.cCode;
    var cntNo    = payload.cntNo;
    var userMob  = cCode + cntNo;
    var auth     = reqObj.auth;
    var userData;
    getUserDocument(auth.userId, function (err, res) {
        if (!err && res.length > 0) {
            userData = res[0][bucketName];
            if (userData.mobile.number == userMob) {
                if (auth.otp) {
                    var data = {
                        code    : Utils.getRandomNumber(6),
                        mobileNo: userData.mobile.number,
                        date    : moment().toISOString(),
                        verified: false
                    };

                    Utils.N1qlUpdateQueryFormation(data, function (err, result) {
                        result.id   = authorization;
                        result.type = auth.type;
                        updateDocument(result, function (err, res) { // update Otp status (verified) after verification
                            if (!err) {
                                console.log(userData);
                                var mobileNo = mobile.number;
                                //TODO - need to send otp
                                // sendOTPMessage(userData);
                                return callback(null, res);
                            } else {
                                return callback(err);
                            }
                        })
                    })

                } else {
                    return callback(null, MSG_CODE.RES_CANT_SEND_OTP);
                }
            } else {
                return callback(null, MSG_CODE.RES_INVALID_MOB_NO);
            }
        }
        else {
            console.log("user err");
            return callback(MSG_CODE.RES_INVALID_ID)
        }

    })


}


/**
 * Update Profile
 *
 * @param reqObj
 * @param callback
 */
user.updateProfile = function (reqObj, callback) {
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];
    var payload  = reqObj.payload;
    var auth     = reqObj.auth;
    var userId   = auth.userId;
    var userDoc;

    async.series([
        function (innerCb) {
            getUserDocument(userId, function (err, res) {
                if (!err && res.length > 0) {
                    userDoc = res[0][bucketName];
                    return innerCb();
                } else {
                    if (!err) {
                        err = MSG_CODE.RES_INVALID_USERID
                    }
                    return innerCb(err);
                }
            })
        },
        function (innerCb) {
            if (payload.mail && payload.mail.password) {

                var oldPwd = userDoc.mail.password;
                var curPwd = Utils.generateSaltPassword(payload.mail.currentPassword);

                if (oldPwd == null || curPwd == oldPwd) {
                    if (payload.mail.password == payload.mail.confirmPassword) {
                        var mail     = {
                            mail    : payload.mail.mail,
                            password: Utils.generateSaltPassword(payload.mail.password)
                        };
                        userDoc.mail = mail;
                        return innerCb();
                    } else {
                        return innerCb(MSG_CODE.RES_PASSWORD_NOT_MATCH);
                    }
                } else {
                    return innerCb(MSG_CODE.RES_AUTH_FAILED);
                }
            } else {
                return innerCb();
            }
        },
        function (innerCb) {
            var userData = userDoc;

            if (payload.mail && !userData.regEmail) {
                getEmailDocument(payload.mail.mail, function (err, res) {
                    if (!err) {
                        if (res.length > 0) {
                            return innerCb(MSG_CODE.RES_MAIL_EXISTS);
                        } else {
                            userData.regEmail = payload.mail.mail;

                            var emailDoc = {
                                userId  : userId,
                                mail    : payload.mail,
                                status  : 'VERIFIED',
                                isActive: false
                            };
                            createEmailDocument(emailDoc, innerCb);
                        }
                    } else {
                        return innerCb(err);
                    }
                })
            } else {
                return innerCb();
            }
        },
        function (innerCb) {

            var userData = userDoc;
            if (payload.name) {
                userData.name = payload.name;
            }
            if (payload.profession) {
                userData.profession = payload.profession;
            }
            if (payload.description) {
                userData.description = payload.description;
            }
            if (payload.imageKey) {
                userData.imageKey = payload.imageKey;
            }
            if (payload.mbNo) {
                userData.mbNo = payload.mbNo;
            }
            userData.setupCompleted = true;
            upsertUserDocument(userData, MSG_CODE, function (err, res) {
                if (!err && res.length > 0) {
                    userDoc = res[0][bucketName];
                    return innerCb();
                } else {
                    return innerCb(err);
                }
            })

        }
    ], function (err, res) {
        if (!err) {
            var resObj   = {
                user: userDoc
            };
            var response = _.extend(Utils.buildSuccessResponse(MSG_CODE.RES_SUCCESS), resObj)
            return callback(null, response);
        } else {
            return callback(err);
        }
    });
};

user.updateProfileCustom = function (reqObj, callback) {
    var payload  = reqObj.payload;
    var auth     = reqObj.auth;
    var userId   = auth.userId;
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];

    getUserDocument(userId, function (err, result) {
        if (!err && result.length > 0) {
            var userData    = result[0][bucketName];
            var payloadKeys = Object.keys(payload);
            _.each(payloadKeys, function (key) {
                if (key != 'mail' || key != 'facebook' || key != 'gplus') {
                    userData[key] = payload[key];
                }
            });

            if (payload.mail) {
                var mail      = {
                    mail    : payload.mail.mail,
                    password: Utils.generateSaltPassword(payload.mail.password)
                };
                userData.mail = mail;
            }

            // var insertKey = '"' + dbKeys.USER + validData.id + '",' + JSON.stringify(validData);
            // var reqObjParams = {
            //     bucketName: bucketName,
            //     key: insertKey
            // };
            upsertUserDocument(userData, function (err, res) {
                if (!err) {
                    var resObj = {
                        user: userData
                    };
                    return callback(null, true);
                } else {
                    return callback(err);
                }
            })
            //userService.updateUserDocument(result.value, result.cas, function (err, response) {
            //    if (!err) {
            //        var resObj = {
            //            user: userData
            //        };
            //        return callback(null, true);
            //    } else {
            //        return callback(err);
            //    }
            //});
        } else {
            if (!err) {
                err = RES_MSG.RES_INT_SERVER_ERR
            }
            return callback(err);
        }
    });
};

user.validateSession = function (reqObj, callback) {
    var payload = reqObj.payload;
    var apiId   = 'validateSession';
    //var moduleId = ;
    console.log(reqObj)

    var MSG_CODE = RESP_MSG[moduleId][apiId];
    console.log(payload.authorization)
    userService.getAndTouchAuthDocument(payload.authorization, function (err, authResult) {
        console.log(authResult)
        if (!err && authResult) {
            //console.log("+++++++++++++++=========auth" , authResult.value.userId)
            if (authResult.value.accountMode == 'ACCOUNT_HOLDER') {
                getUserDocument(authResult.value.userId, function (err, result) {
                    //  console.log(err, result)
                    if (!err && result.length > 0) {
                        var data            = result[0][bucketName];
                        data.setupCompleted = true;
                        console.log(data.setupCompleted)
                        if (data.setupCompleted) {
                            data.userId        = data.id;
                            data.authorization = payload.authorization;
                            data.loginMode     = authResult.value.loginMode;
                            data.accountMode   = authResult.value.accountMode;
                            data.loginType     = authResult.value.loginType;
                            data.deviceId      = authResult.value.deviceId;
                            data.mode          = authResult.value.mode;
                            data.otp           = "1111";
                            console.log("aaaaaaauth", JSON.stringify(authResult.value.otp))
                            return callback(null, data);
                        } else {
                            return callback(MSG_CODE.RES_PROFILE_NOT_COMPLETED);
                        }
                    } else {
                        if (!err) {
                            err = MSG_CODE.RES_INT_SERVER_ERR;
                        }
                        return callback(err);
                    }
                });
            } else {
                authResult.value.authorization = payload.authorization;
                return callback(null, authResult.value);
            }
        } else {
            if (!err) {
                err = MSG_CODE.RES_BAD_TOKEN;
            }
            return callback(err);
        }
    });
};

user.validateSessionForInActiveUsers = function (reqObj, callback) {
    var payload  = reqObj.payload;
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];

    userService.getAndTouchAuthDocument(payload.authorization, function (err, authResult) {
        if (!err && authResult) {
            if (authResult.value.mode == "WEB") {
                getUserDocument(authResult.value.userId, function (err, result) {
                    if (!err && result.length > 0) {
                        var userDoc           = result[0][bucketName];
                        userDoc.userId        = userDoc.id;
                        userDoc.authorization = payload.authorization;
                        return callback(null, userDoc);
                    } else {
                        if (!err) {
                            err = RES_MSG.RES_INT_SERVER_ERR;
                        }
                        return callback(err);
                    }
                });
            } else {
                if (authResult.value.accountMode == 'ACCOUNT_HOLDER') {
                    getUserDocument(authResult.value.userId, function (err, result) {
                        if (!err && result.length > 0) {
                            var userDoc           = result[0][bucketName];
                            userDoc.userId        = userDoc.id;
                            userDoc.authorization = payload.authorization;
                            userDoc.loginMode     = authResult.value.loginMode;
                            userDoc.accountMode   = authResult.value.accountMode;
                            userDoc.loginType     = authResult.value.loginType;
                            userDoc.deviceId      = authResult.value.deviceId;
                            userDoc.mode          = authResult.value.mode;

                            return callback(null, userDoc);
                        } else {
                            if (!err) {
                                err = RES_MSG.RES_INT_SERVER_ERR;
                            }
                            return callback(err);
                        }
                    });
                } else {
                    authResult.value.authorization = payload.authorization;
                    return callback(null, authResult.value);
                }
            }
        } else {
            if (!err) {
                err = RES_MSG.RES_BAD_TOKEN;
            }
            return callback(err);
        }
    });
};

user.getProfile = function (reqObj, callback) {
    console.log("Goood morng", reqObj)
    var params   = reqObj.params;
    var userId   = params.id;
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];
    getUserDocument(userId, function (err, result) {
        if (!err && result.length > 0) {
            return callback(null, {user: result[0][bucketName]});
        } else {
            if (!err) {
                err = MSG_CODE.RES_INVALID_USERID;
            }
            return callback(err);
        }
    });
};

user.getProfileForMicroApp = function (reqObj, callback) {
    var params   = reqObj.params;
    var userId   = params.id;
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];
    getUserDocument(userId, function (err, result) {
        if (!err && result.length > 0) {
            return callback(null, {user: result[0][bucketName]});
        } else {
            if (!err) {
                err = RES_MSG.RES_INVALID_USERID;
            }
            return callback(err);
        }
    });
};

user.setSettings = function (reqObj, callback) {
    var payload  = reqObj.payload;
    var auth     = reqObj.auth;
    var userId   = auth.userId;
    var apiId    = request.apiId;
    var moduleId = request.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];
    getUserDocument(userId, function (err, result) {
        if (!err && result.length > 0) {
            var userData = result[0][bucketName];

            var payloadKeys = _.keys(payload);

            _.each(payloadKeys, function (key) {
                userData[key] = payload[key];
            });

            // var insertKey = '"' + dbKeys.USER + validData.id + '",' + JSON.stringify(validData);
            // var reqObjParams = {
            //     bucketName: bucketName,
            //     key: insertKey
            // };
            upsertUserDocument(userData, function (err, res) {
                return callback(null, RES_MSG.RES_SUCCESS);
            })
        } else {
            if (!err) {
                err = RES_MSG.RES_INT_SERVER_ERR;
            }
            return callback(err);
        }
    });
};

user.verifyEmail = function (reqObj, callback) {
    var params   = reqObj.params;
    var payload  = reqObj.payload;
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];
    var task     = [];
    var userData;
    var userId;
    task.push(function (innerCb) {
        getEmailDocument(params.email, function (err, res) {
            console.log("getEmailDocument", res)
            if (!err && res.length > 0) {
                userId = res[0][bucketName].userId;
                return innerCb();
            } else {
                return innerCb(MSG_CODE.RES_INVALID_ID);
            }
        });
    });

    task.push(function (innerCb) {
        getUserDocument(userId, function (err, res) {
            if (!err && res.length > 0) {
                userData = res[0][bucketName];
                if (userData.status == 'ACTIVATED') {
                    return innerCb();
                } else {

                    if (userData.verifyCode == payload.verifyCode) {
                        var insertKey    = '"' + dbKeys.USER + userData.id + '"';
                        var reqObjParams = {
                            bucketName: bucketName,
                            key       : insertKey,
                            updateKey : "status",
                            data      : "ACTIVATED"
                        };
                        updateUserDoc(reqObjParams, function (err, res) {
                            return innerCb();
                        })
                    } else {
                        return innerCb(MSG_CODE.RES_INVALID_VERIFICATION_CODE);
                    }
                }
            } else {
                return innerCb(MSG_CODE.RES_INVALID_ID);
            }
        })
    });

    task.push(function (innerCb) {
        getEmailDocument(params.email, function (err, res) {
            if (!err && res.length > 0) {
                if (res[0][bucketName].isActive) {
                    return innerCb(MSG_CODE.RES_ALREADY_VERIFIED);
                } else {
                    var mailData     = res[0][bucketName];
                    var insertKey    = '"' + dbKeys.EMAIL + mailData.id + '"';
                    var reqObjParams = {
                        bucketName: bucketName,
                        key       : insertKey,
                        updateKey : 'isActive',
                        data      : true
                    };
                    updateUserDoc(reqObjParams, function (err, res) {

                    })
                    return innerCb();
                }
            } else {
                return innerCb(MSG_CODE.RES_INT_SERVER_ERR);
            }
        })
    });

    async.series(task, function (err, res) {
        if (!err) {
            return callback(null, MSG_CODE.RES_SUCCESS);
        } else {
            return callback(err);
        }
    });

};

/**
 * Logout
 *
 * @param reqObj - required
 * @param callback - required
 */
user.logout = function (reqObj, callback) {
    var auth          = reqObj.auth;
    console.log("+++++++++++++", auth)
    var apiId         = reqObj.apiId;
    var moduleId      = reqObj.moduleId;
    var MSG_CODE      = RESP_MSG[moduleId][apiId];
    var userId        = auth.userId;
    var authorization = auth.authorization;
    var asyncTasks    = [];

    if (auth.accountMode == 'ACCOUNT_HOLDER') {
        asyncTasks.push(function (innerCb) {
            //delete Auth documentcommonService.queryBuilder(constantQuery.INSERTAUTH, reqObjParams, function (resData, resValue) {
            deleteAuthDocument(authorization, function (err, res) {

            });
            return innerCb();
        });
        //asyncTasks.push(function (innerCb) {
        //    var reqObj = {
        //        authToken: authorization,
        //        userId: userId
        //    };
        //    //delete Session document
        //    removeAuthTokenInSessionDocument(reqObj, function (err, result) {
        //        console.log(err, result);
        //    });
        //    innerCb();
        //});

        if (auth.deviceId) {
            asyncTasks.push(function (innerCb) {
                //Remove deviceId from User Device Document
                removeDeviceIdInUserDeviceDocument(auth, function (err, result) {
                    innerCb();
                });

            });
        }

        async.series(asyncTasks, function (err, results) {
            if (!err) {
                console.log("dfgdf")
                return callback(null, MSG_CODE.RES_SUCCESS);
            } else {
                console.log("jhedui")
                return callback(err);
            }
        });
    } else {
        deleteAuthDocument(authorization, function (err, res) {

        })
        return callback(null, MSG_CODE.RES_SUCCESS);
    }
};

/**
 * deleteAuthDocument
 * @param req
 * @param callback
 */
function deleteAuthDocument(req, callback) {
    var insertKey    = '"' + dbKeys.AUTH + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.DELETEAUTH, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log(result)
            callback(null, result);
        });
    });
}

/**
 * deleteFBDocument
 * @param req
 * @param callback
 */
function deleteFBDocument(req, callback) {
    var insertKey    = '"' + dbKeys.FB + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.DELETEFB, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log(result)
            callback(null, result);
        });
    });
}

/**
 * delete GPlusDocument
 * @param req
 * @param callback
 */
function deleteGPlusDocument(req, callback) {
    var insertKey    = '"' + dbKeys.GPLUS + req + '"';
    var reqObjParams = {
        bucketName: bucketName,
        key       : insertKey
    };
    commonService.queryBuilder(constantQuery.DELETEGPLUS, reqObjParams, function (resData, resValue) {
        commonService.query(resData, resValue, function (err, result) {
            console.log(result)
            callback(null, result);
        });
    });
}

/**
 * Remove DeviceId from UserDevice Document
 * @param reqObj - required
 * @param callback - required
 */
function removeDeviceIdInUserDeviceDocument(reqObj, callback) {
    console.log("req at userDev", reqObj)
    var deviceId   = reqObj.deviceId;
    var deviceType = reqObj.mode;
    getUserDevDocument(reqObj.userId, function (err, res) {
        if (!err && res.length > 0) {
            var userDevDoc = res[0][bucketName];
            console.log(userDevDoc)
            if (!userDevDoc.tokens[deviceType]) {
                return callback();
            } else {
                delete userDevDoc.tokens[deviceType][deviceId];
                var req = {
                    id  : reqObj.userId,
                    data: userDevDoc
                }
                removedeviceIdInUSRDOC(req, function (err, res) {
                    if (!err) {
                        return callback();
                    } else {
                        return callback(err);
                    }
                })
            }
        } else {
            return callback(err);
        }
    })
};

function removedeviceIdInUSRDOC(req, MSG_CODE, callback) {
    validateData(req.data, USER_DEV_DATA_SCHEMA, {stripUnknown: true}, MSG_CODE, function (err, validData) {
        var insertKey    = '"' + dbKeys.USER_DEV + req.id + '",' + JSON.stringify(validData);
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        commonService.queryBuilder(constantQuery.UPSERTUSERDEVDOC, reqObjParams, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                if (!err) {
                    return callback();
                } else {
                    return callback(err)
                }
            });
        });
    })
}

user.getMultiUserDetails = function (reqObj, callback) {
    var payload = reqObj.payload;
    var auth    = reqObj.auth;
    var userIds = payload.ids;
    //var isObj = payload.isObj;
    var usersData = [];
    async.forEach(userIds, function (id, innerCb) {
            getUserDocument(id, function (err, resUserDoc) {
                if (!err && resUserDoc.length > 0) {
                    usersData.push(resUserDoc[0][bucketName]);
                    return innerCb();
                } else {
                    return innerCb(err);
                }

            })
        },
        function (err, result) {
            if (!err) {
                console.log('hai', usersData)
                var user = {
                    users: usersData
                }
                return callback(null, user);
            } else {
                return callback(RES_MSG.RES_INT_SERVER_ERR);
            }
        })
};

/**
 * Change Login Mode
 *
 * @param reqObj - required
 * @param callback - required
 */
user.changeLoginMode = function (reqObj, callback) {
    var auth          = reqObj.auth;
    console.log("helooooooooo", reqObj)
    var payload       = reqObj.payload;
    var authorization = auth.authorization;
    var req           = {
        id       : authorization,
        updateKey: 'loginMode',
        data     : JSON.stringify(payload.loginMode)
    };
    updateAuthDocument(req, function (err, res) {
        if (!err) {
            return callback(null, RES_MSG.RES_SUCCESS);
        } else {
            return callback(err);
        }
    })
};

function profileVerifyByFb(auth, payload, MSG_CODE, callback) {
    var seriesTask = [];
    var facebook   = payload.facebook;
    var userDocument;
    var userId     = auth.userId;

    seriesTask.push(function (seriesCb) {
        getUserDocument(userId, function (err, res) {
            if (!err && res.length > 0) {
                userDocument = res[0][bucketName];
                if (userDocument.status == 'VERIFIED') {
                    return seriesCb(MSG_CODE.RES_PROFILE_VERIFIED_ALREADY);
                } else {
                    return seriesCb();
                }
            } else {
                if (!err || !res) {
                    err = MSG_CODE.RES_INT_SERVER_ERR;
                }
                return seriesCb(err);
            }
        })
    });

    seriesTask.push(function (seriesCb) {
        getFbDocument(facebook.fbId, function (err, res) {
            if (!err) {
                if (!res) {
                    return seriesCb();
                } else {
                    return seriesCb(MSG_CODE.RES_FACEBOOK_ALREADY_LINKED);
                }
            } else {
                return seriesCb(err);
            }
        });
    });

    seriesTask.push(function (seriesCb) {
        createFBDocument(payload, MSG_CODE, function (err, result) {
            if (!err) {
                return seriesCb(null, result);
            } else {
                return seriesCb(err);
            }
        });
    });

    seriesTask.push(function (seriesCb) {
        userDocument.facebook = facebook;
        userDocument.status   = 'VERIFIED';
        upsertUserDocument(userDocument, MSG_CODE, function (err, res) {
            if (!err) {
                return seriesCb()
            } else {
                deleteFBDocument(facebook.fbId, function (err, res) {
                    console.log('deleting fb document');
                });
                return seriesCb(err);
            }
        });
    });

    async.series(seriesTask, function (err, res) {
        if (!err) {
            return callback(null, true);
        } else {
            return callback(err);
        }
    });
};

function profileVerifyByGPlus(auth, payload, MSG_CODE, callback) {
    var seriesTask = [];
    var gplus      = payload.gplus;
    var userDocument;
    var userId     = auth.userId;
    seriesTask.push(function (seriesCb) {
        getUserDocument(userId, function (err, res) {
            if (!err && res.length > 0) {
                userDocument = res[0][bucketName];
                if (userDocument.status == 'VERIFIED') {
                    return seriesCb(MSG_CODE.RES_PROFILE_VERIFIED_ALREADY);
                } else {
                    return seriesCb();
                }
            } else {
                if (!err || !res) {
                    err = MSG_CODE.RES_INT_SERVER_ERR;
                }
                return seriesCb(err);
            }
        })
    });

    seriesTask.push(function (seriesCb) {
        getGplusDocument(gplus.gmail, function (err, res) {
            if (!err) {
                if (res.length == 0) {
                    return seriesCb();
                } else {
                    return seriesCb(RES_MSG.RES_GPLUS_ALREADY_LINKED);
                }
            } else {
                return seriesCb(err);
            }
        });
    });

    seriesTask.push(function (seriesCb) {
        createGPlusDocument(payload, MSG_CODE, function (err, result) {
            if (!err) {
                return seriesCb();
            } else {
                return seriesCb(err);
            }
        });
    });

    seriesTask.push(function (seriesCb) {
        var userData    = userDocument.value;
        userData.gplus  = gplus;
        userData.status = 'VERIFIED';
        upsertUserDocument(userData, MSG_CODE, function (err, res) {
            if (!err) {
                return seriesCb()
            } else {
                deleteGPlusDocument(gplus.gmail, function (err, res) {
                    console.log('deleting fb document');
                });
                return seriesCb(err);
            }
        });
    });

    async.series(seriesTask, function (err, res) {
        if (!err) {
            return callback(null, true);
        } else {
            return callback(err);
        }
    });
};

user.profileVerifyEmailUser = function (reqObj, callback) {
    var payload  = reqObj.payload;
    var auth     = reqObj.auth;
    var apiId    = reqObj.apiId;
    var moduleId = reqObj.moduleId;
    var MSG_CODE = RESP_MSG[moduleId][apiId];

    if (payload.loginType == 'FB') {
        if (payload.facebook) {
            profileVerifyByFb(auth, payload, MSG_CODE, callback);
        } else {
            return callback(RES_MSG.RES_BAD_REQUEST);
        }
    } else {
        if (payload.gplus) {
            profileVerifyByGPlus(auth, payload, MSG_CODE, callback);
        } else {
            return callback(RES_MSG.RES_BAD_REQUEST);
        }
    }
};

///// ################# For CMS

user.getDeviceInfo = function (request, callback) {
    var payload  = request.payload;
    var userId   = payload.userId;
    var deviceId = payload.deviceId;
    var mode     = payload.mode;

    getUserDevDocument(userId, function (err, res) {
        if (!err && res.length > 0) {
            var userDevList = res[0][bucketName].tokens;
            if (userDevList[mode]) {
                var devTokens = userDevList[mode];
                var devIdObj  = _.indexBy(devTokens, "deviceId");
                if (devIdObj && devIdObj[deviceId]) {
                    var resObj         = {
                        device: devIdObj[deviceId]
                    };
                    resObj.device.mode = mode;
                    return callback(null, resObj);
                } else {
                    return callback(RES_MSG.RES_DEVICE_NOT_FOUND);
                }
            } else {
                return callback(RES_MSG.RES_DEVICE_NOT_FOUND);
            }
        } else {
            if (!err) {
                err = RES_MSG.RES_INT_SERVER_ERR;
            }
            return callback(err);
        }
    })
};

/**
 * Validating the Data before insert and upsert
 * @param data
 * @param schema
 * @param options
 * @param {Response Messages} MSG_CODE
 * @param callback
 */

function validateData(data, schema, options, MSG_CODE, callback) {
    console.log("at validateData ", data)
    if (options instanceof Function) {
        callback = arguments[2];
        options  = {};
    }

    joi.validate(data, schema, options, function (err, validData) {
        if (!err) {
            console.log("validate", validData)
            return callback(null, validData);
        } else {
            console.log('ValidationError', err);
            return callback(MSG_CODE.RES_CUSTOM_ERROR(err.toString()));
        }
    });
}

/**
 * Update the User Document
 * @param request
 * @param callback
 */

function updateDocument(request, callback) {
    var docType = request.type;
    var docId   = request.id;
    var data    = request.queryData;
    var query   = request.query + ' RETURNING *';
    var tasks   = [];

    tasks.push(function (innerCb) {
        findDocumentPrefix(docType, function (err, result) {
            if (!err) {
                var dbKey = result;
                return innerCb(null, dbKey)
            } else {
                return innerCb(err);
            }
        })
    });

    tasks.push(function (dbKey, innerCb) {
        var insertKey    = '"' + dbKey + docId + '"';
        var reqObjParams = {
            bucketName: bucketName,
            key       : insertKey
        };
        var response     = _.extend(data, reqObjParams);
        commonService.queryBuilder(query, response, function (resData, resValue) {
            commonService.query(resData, resValue, function (err, result) {
                if (!err) {
                    return innerCb();
                } else {
                    return innerCb(err);
                }
            });
        });
    });

    async.waterfall(tasks, function (err, res) {
        if (!err) {
            return callback(null, res)
        } else {
            return callback(err);
        }
    });

}

/**
 * To find Prefix of the Document
 * @param type
 * @param callback
 * @returns {*}
 */

function findDocumentPrefix(type, callback) {
    if (type == 'authentication') {
        return callback(null, dbKeys.AUTH)
    } else if (type == 'file') {
        return callback(null, dbKeys.FILE)
    } else if (type == 'user') {
        return callback(null, dbKeys.USER)
    } else if (type == 'device') {
        return callback(null, dbKeys.DEVICE)
    } else if (type == 'device_info') {
        return callback(null, dbKeys.DEVICE_INFO)
    } else {
        return callback(RES_MSG.RES_INT_SERVER_ERR);
    }
}

/**
 * Forming Updated user Data
 * @param data
 * @param payload
 * @param callback
 * @returns {*}
 */

function getUpdatePayloadData(data, payload, callback) {
    if (payload.location) {
        data.location = payload.location;
    }
    if (payload.name) {
        data.name = payload.name;
    }
    if (payload.gender) {
        data.gender = payload.gender;
    }
    if (payload.mobile) {
        data.mobile = payload.mobile;
    }
    if (payload.imageURL) {
        data.imageURL = payload.imageURL;
    }
    if (payload.timeZone) {
        data.timeZone = payload.timeZone;
    }
    if (payload.mobile) {
        data.mobile = payload.mobile;
    }
    if (payload.profession) {
        data.profession = payload.profession;
    }
    if (payload.description) {
        data.description = payload.description;
    }
    if (payload.imageKey) {
        data.imageKey = payload.imageKey;
    }
    if (payload.mbNo) {
        data.mbNo = payload.mbNo;
    }

    return callback(null, data)
}

module.exports = user;