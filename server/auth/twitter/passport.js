var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var uuid = require('node-uuid');
var utils = require('../../utils')
var UserController = require('../../api/user/user.controller');

exports.setup = function (User, config) {
  
  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.clientID,
    consumerSecret: config.twitter.clientSecret,
    callbackURL: config.twitter.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({
      $or: [
        { 'twitter.id_str': profile.id }
      ]
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        user = new User({
          name: profile.displayName,
          username: profile.username,
          role: 'user',
          provider: 'twitter',
          twitter: profile._json
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
        user.twitter = profile._json;
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
    });
    }
  ));
};
