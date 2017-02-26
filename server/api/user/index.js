'use strict';
var https = require('https');

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:username', controller.show);
router.get('/:id/account', controller.checkins);
router.put('/:id/password', controller.changePassword);
router.get('/:id/rumors', controller.getRumors);
router.get('/me', controller.me);

router.post('/:id/rumors', controller.createRumorReq);
router.post('/', controller.create);
router.delete('/:id', controller.destroy);

setInterval(function() {
  console.log("Propagating Rumors")
  controller.propagateRumors();
}, 5000)

module.exports = router;