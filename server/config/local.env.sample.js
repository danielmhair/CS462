'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'www.danielmhair.com:3006',
  SESSION_SECRET:   'onkey-secret',

  FACEBOOK_ID:      'app-id',
  FACEBOOK_SECRET:  'secret',

  TWITTER_ID:       'app-id',
  TWITTER_SECRET:   'secret',

  GOOGLE_ID:        'app-id',
  GOOGLE_SECRET:    'secret',

  FOURSQUARE_ID:    'app-id',
  FOURSQUARE_SECRET:'secret',
  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
