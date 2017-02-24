var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var util = require('util');
var url = require('url');
var mongoose = require('mongoose');
var path = require('path')

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  }
);
// Populate DB with sample data
// if(config.seedDB) { require('./config/seed'); }

express.static.mime.default_type = "text/html";

var app = express();
var options = {
    host: config.ip,
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(config.httpPort);
https.createServer(options, app).listen(config.httpsPort);
app.set("view options", {layout: false});
app.use('/CS201R', express.static('..'));
app.use('/prev', express.static('../views'));
app.use(express.static('../home'));
app.use('/rewardme', express.static('../uRewardMe/build'));

require('./config/express')(app);
require('./routes')(app);
