'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var https = require('https')
var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

exports.getRumors = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    if (!user) return res.status(404).send("Unable to get user")
    return res.status(200).json(user.rumors)
  });
}

exports.createRumor = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(404).send("Unable to get user")
    var text = req.body.message
    var originator = user.username;
    var maxSequenceNum = user.rumors
    .filter(function(rumor) { return rumor.messageId.split(":")[0] === user.uuid })
    .map(function(rumor) { return parseInt(rumor.messageId.split(":")[1]) })
    .reduce(function(a,b) { return Math.max(a,b); })
    var messageId = user.uuid + ":" + (maxSequenceNum + 1);
    user.rumors.push({
      messageId: messageId,
      originator: originator,
      text: text
    })
    user.save(function(err) {
      if (err) return validationError(res, err);
      res.status(201).send('OK');
    });
  });
}

exports.checkins = function(req, res) {
  var token = req.query.token;
  var username = req.query.username;
  if (!token) {
    return res.json({ error: "No token found"});
  }
  var options = {
    hostname: 'api.foursquare.com',
    path: '/v2/users/self/checkins',
    method: 'GET',
    oauth_token : token,
  };
  var URI = 'https://api.foursquare.com/v2/users/self/checkins';
  var query = "?oauth_token=" + token + '&v=20170214';
  var completeURI = URI + query;
  getCheckins(completeURI, req.param("id")).then(function(data) {
    console.log(data)
    res.status(200).json(data)
  }).catch(function(err) {
    return res.status(500).json({ error: err })
  })
};

function getCheckins(url, id) {
  console.log(url);
  return new Promise(function(resolve, reject) {
    var body = '';
    var json = '';
    https.get(url, function(resp){
      resp.on("data", function(chunk) {
        body += chunk;
      });
      resp.on('end', function(){
        json = JSON.parse(body);
        var checkin = json.response.checkins;
        console.log(json)
        console.log(checkin)
        User.findOneAndUpdate({'_id': id}, checkin, function(err, user){
          if (err) return reject({ error: err });
          resolve({user: user, checkins: checkin, json: json });
        });
      });
      
      resp.on("error", function(err) {
        reject(err)
      })
    })
  });
}

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.seed = getRandom(0, 5) % 3 === 0;
  if (newUser.seed) {
    // Put all the other seeds as its neighbors and give me to them as a neighbor
    User.find({ seed: true }, function(err, users) {
      if (err) return res.status(500).json(err);
      if (!users) return res.status(404).json("Unable to get users.")
      
      operations = []
      users.forEach(function(user) {
        if (user.neighbors.indexOf(newUser.uuid) == -1) {
          user.neighbors.push(newUser.uuid)
          operations.push(saveUser(user))
        }
        if (newUser.neighbors.indexOf(user.uuid) == -1) {
          //user not in neighbors
          newUser.neighbors.push(user.uuid)
          operations.push(saveUser(newUser))
        }
      })
      
      Promise.all(operations)
      .then(function(results) {
        console.log(results)
        // I send my own token here (don't worry about this).
        // You will do res.send(...your view...)
        var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 60*5 });
        return res.status(200).json({ token: token });
      })
      .catch(function(err) {
        console.error(err)
        return validationError(res, err);
      })
    })
  } else {
    User.find({ seed: true}, function(err) {
      if (err) return res.status(500).json(err);
      if (!users) return res.status(404).json("Unable to get users.")
      
      // Add one of the seeds as its neighbor
      var index = getRandom(0, users.length);
      var user = users[index]
      newUser.neighbors.push(user.uuid)
      
      // The seed user will have this new user as a neighbor
      user.neighbors.push(newUser.uuid)
      
      // Wait until both users are saved
      Promise.all([
        saveUser(newUser),
        saveUser(user)
      ])
      .then(function(results) {
        var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 60*5 });
        return res.status(200).json({ token: token });
      })
      .catch(function(err) {
        return validationError(res, err);
      })
    })
  }
};

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function saveUser(user) {
  return new Promise(function(resolve, reject) {
    user.save(function(err) {
      if (err) return reject(err)
      return resolve()
    })
  });
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var username = req.params.username;
  
  User.findOne({username: username}, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);
  
  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};