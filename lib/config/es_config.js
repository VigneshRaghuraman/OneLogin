
var elasticsearch = require('elasticsearch');
var appConfig = require('./app');

var esClient = new elasticsearch.Client(appConfig.database.elasticsearch);

module.exports = esClient;
