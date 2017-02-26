var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var uuid = require('node-uuid');
var utils = require('../../utils')
var UserController = require('../../api/user/user.controller');

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        $or: [
          { 'email': profile.emails[0].value },
          { 'google.id': profile.id }
        ]
      }, function(err, user) {
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.username,
            provider: 'google',
            google: profile._json
          });
          if (user._id && !user.nodeEndpoint) {
            user.nodeEndpoint = "/api/users/" + user._id + "/rumors";
          }
          if (utils.getRandom(0,5) % 3 == 0) {
            user.seed = true;
          }
          if (!user.uuid) {
            user.uuid = uuid.v4();
          }
          console.log(user)
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        } else {
          user.google = profile._json;
          if (user._id && !user.nodeEndpoint) {
            user.nodeEndpoint = "/api/users/" + user._id + "/rumors";
          }
          if (!user.uuid) {
            user.uuid = uuid.v4();
          }
          if (utils.getRandom(0,5) % 3 == 0) {
            user.seed = true;
          }
          console.log(user)
          UserController.addNeighborAndSave(user)
          .then(function(results) {
            console.log(results);
            done(null, user);
          })
          .catch(function(err) {
            done(err);
          })
        }
      });
    }
  ));
};
