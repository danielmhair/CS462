'use strict';

var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  }
);
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

var app = express();
var options = {
    host: config.ip,
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

// http.createServer(app).listen(config.httpPort);
https.createServer(options, app).listen(config.httpsPort, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

require('./config/express')(app);
require('./routes')(app);

// Expose app
exports = module.exports = app;
