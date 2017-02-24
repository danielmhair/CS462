'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var config = require('../../config/environment');
var router = express.Router();

router
  .get('/', passport.authenticate('facebook', {
    scope: ['email', 'user_about_me'],
    failureRedirect: config.appUrl + '#/login?loginMessage=Unable to login with facebook&intendedLogout=false',
    session: false
  }))

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: config.appUrl + '#/login?loginMessage=Unable to login with facebook&intendedLogout=false',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
