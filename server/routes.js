/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var cors = require('cors');
module.exports = function(app) {
  app.use(cors());
  
  app.get('/healthcheck', function(req, res) {
    res.json({})
  })
  
  // Insert routes below
  app.use('/api/users', require('./api/user'));
  
  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
  .get(errors[404]);
};
