'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.get('/', passport.authenticate('foursquare', { 
            failureRedirect: '/signup', 
            session: false 
          }), function(res, req) {})
      .get('/callback', passport.authenticate('foursquare', {
            failureRedirect: '/signup',
            session: false
          }), auth.setTokenCookie);

module.exports = router;