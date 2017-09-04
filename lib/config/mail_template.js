/**
 * Created by hmspl on 12/9/16.
 */


var _                            = require('underscore');
var template                     = {};
template.sendVerificationURL     = function (emailObject) {
    var template = _.template("Dear <%= name %>," + "Please proceed with below link to verify your account. " + "Verification Link : <%= verificationURL %>  " + "" + "This Link is Valid for 48 hours." + " Regards,        The aXcessGolf Team");
    return template(emailObject);
};
template.sendAdminCredentials    = function (emailObject) {
    var template = _.template("Dear <%= name %>,     " + "You have been added as an <%= role %> for aXcessGolf.     " + "Please login to <%= URL %> with your credentials :-    " + "Username : <%= username %>     " + "Password : <%= password %>    " + "When you login, be sure to change your password." + "   Regards,        The aXcessGolf Team");
    return template(emailObject);
};
template.sendAdminForgotPassword = function (emailObject) {
    var template = _.template("Dear <%= name %>," + "Thanks for contacting us." + "Your Password is <%=password%>" + "Regards,The 4Real Team");
    return template(emailObject);
};

template.comment = function (emailObject) {
    var template = _.template("Dear <%= name %>," + "Thanks for contacting us." + "comment <%=comment%>" + "Regards,4Real User");
    return template(emailObject);
};

module.exports                   = template;