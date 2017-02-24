'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var domain = "https://www.danielmhair.com";
var app = "https://www.danielmhair.com/foursquare-integration/";
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),
  
  appUrl: app,
  tokenAgeInMinutes: 60*5,

  // Server port
  httpsPort: 443,
  httpPort: 80,
  
  // Server IP
  ip: '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'upickit-secret'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || '470257669848563',
    clientSecret: process.env.FACEBOOK_SECRET || 'a4278103b2da0dcd5c0c39dddc63b0d9',
    callbackURL:  domain + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || '36LwYpi132fVTnyVnTCIEWMg1',
    clientSecret: process.env.TWITTER_SECRET || '4w5KrYPx6UQyN08Jf6sJWVNGZbDlxqo367QSsSbFnkYWuIbmBy',
    callbackURL:  domain + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || '3567147298-h3egd5uclcgrn18noun537qvvbd4lj7d.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'MOB6GXFU5VEZpne9_DggAlZF',
    callbackURL:  domain + '/auth/google/callback'
  },

  foursquare: {
    clientID:     process.env.FOURSQUARE_ID || 'A3SKR3PONW1X5TZ30XXVL4IXW1O2MM0B2JDRMFMJSOV1YGTP',
    clientSecret: process.env.FOURSQUARE_SECRET || 'QV0TE0C55MGGNGWCBYFZX1WG3FYYUBZVBLZF5A5QL0KBVC3Y',
    callbackURL:  domain + '/auth/foursquare/callback'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
