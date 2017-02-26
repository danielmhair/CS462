var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var uuid = require('node-uuid');
var utils = require('../../utils');
var UserController = require('../../api/user/user.controller');

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ["id", "email", "first_name", "displayName", "gender", "last_name"]
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        'facebook.id': profile.id
      },
      function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json
          });
          if (user._id && !user.nodeEndpoint) {
            user.nodeEndpoint = "/api/users/" + user._id + "/rumors";
          }
          if (!user.uuid) {
            user.uuid = uuid.v4();
          }
          if (utils.getRandom(0,5) % 3 == 0) {
            user.seed = true;
          }
          UserController.addNeighborAndSave(user)
          .then(function(results) {
            console.log(results);
            done(null, user);
          })
          .catch(function(err) {
            done(err);
          })
        } else {
          user.facebook = profile._json;
          if (user._id && !user.nodeEndpoint) {
            user.nodeEndpoint = "/api/users/" + user._id + "/rumors";
          }
          if (!user.uuid) {
            user.uuid = uuid.v4();
          }
          if (utils.getRandom(0,5) % 3 == 0) {
            user.seed = true;
          }
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        }
      })
    }
  ));
};
