var joi = require('joi');

var common = {};

common.geoLocation = joi.object({
    lat: joi.number(),
    lon: joi.number()
}).meta({className: 'GeoLocation'});

common.location = joi.object({
    name       : joi.string(),
    no         : joi.string(),
    wing       : joi.string(),
    locality   : joi.string(),
    area       : joi.string(),
    city       : joi.string(),
    state      : joi.string(),
    country    : joi.string(),
    pinCode    : joi.string(),
    geoLocation: common.geoLocation
}).meta({className: 'Location'});

var range = joi.object({
    from: joi.string(),
    to  : joi.string()
}).meta({className: 'Range'});

var geoLocation = joi.object({
    lat: joi.number().required(),
    lon: joi.number().required()
});

common.filter = joi.object({
    type    : joi.string().valid(["FIXED", "RANGE", "LOCATION"]),
    key     : joi.string().description('Key Name').required(),
    range   : range,
    value   : joi.array().items(joi.object({
        type : joi.string().valid(["IN", "NOT_IN"]),
        value: joi.string()
    }).meta({className: 'Value'})),
    location: joi.object({
        range      : range.required(),
        geoLocation: geoLocation.meta({className: 'GeoLocations'}).required()
    }).meta({className: 'Locations'})
}).meta({className: 'Filter'});

common.globalSearchRequest = joi.object({
    index     : joi.number(),
    limit     : joi.number(),
    lstRecvDt : joi.date(),
    sortingKey: joi.string(),
    sortBy    : joi.string().valid(["asc", "desc"]),
    text      : joi.string().required()
}).meta({className:'globalSearchRequest'});

module.exports = common;