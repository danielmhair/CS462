var passport = require('passport');
const FoursquareStrategy = require('passport-foursquare').Strategy;
var uuid = require('node-uuid');
var utils = require('../../utils')
var UserController = require('../../api/user/user.controller');

exports.setup = function (User, config) {
  passport.use(new FoursquareStrategy(
    {
      clientID: config.foursquare.clientID,
      clientSecret: config.foursquare.clientSecret,
      callbackURL: config.foursquare.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(accessToken)
      User.findOne({
        $or: [
          { 'email': profile.emails[0].value },
          { 'foursquare.id': profile.id }
        ]
      }, function(err, user) {
        if (!user) {
          console.log(profile);
          user = new User({
            name: profile.name.givenName + ' ' + profile.name.familyName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.emails[0].value.split('@')[0],
            provider: profile.provider,
            foursquare: profile._json.response.user
          });
          user.foursquare.token = accessToken;
          if (user._id) {
            user.nodeEndpoint = "/api/users/" + user._id + "/rumors";
          }
          if (utils.getRandom(0,5) % 3 == 0) {
            user.seed = true;
          }
          user.uuid = uuid.v4();
          console.log(user.foursquare)
          UserController.addNeighborAndSave(user)
          .then(function(results) {
            console.log(results);
            done(null, user);
          })
          .catch(function(err) {
            done(err);
          })
        } else {
          if (user._id && !user.nodeEndpoint) {
            user.nodeEndpoint = "/api/users/" + user._id + "/rumors";
          }
          if (!user.uuid) {
            user.uuid = uuid.v4();
          }
          if (utils.getRandom(0,5) % 3 == 0) {
            user.seed = true;
          }
          if (!user.foursquare) {
            user.foursquare = profile._json.response.user;
            user.foursquare.token = accessToken;
            console.log(user.foursquare)
            user.save(function(err) {
              if (err) return done(err);
              console.log("No foursquare - user saved.")
              done(err, user)
            });
          } else {
            user.foursquare.token = accessToken;
            user.save(function(err) {
              if (err) return done(err);
              console.log("user saved")
              console.log(user)
              done(err, user)
            })
          }
        }
      });
    }
  ));
};
