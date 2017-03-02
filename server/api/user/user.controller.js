'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var https = require('https');
var uuid = require('node-uuid');
var utils = require('../../utils');

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
    if (!user) return res.status(404).send("Unable to get user");
    return res.status(200).json(user.rumors)
  });
};

exports.resolveWant = function(userId, want) {
  return new Promise(function(resolve, reject) {
    User.findById(userId, function(err, userWithWant) {
      if (err) return reject({status: 500, message: err});
      if (!userWithWant) return reject({status: 404, message: "Unable to get user"});
      User.find({ nodeEndpoint: want.EndPoint }, function(err, userWithRumor) {
        var rumorsToAdd = userWithRumor.rumors
        .filter(function(rumor) {
          var uuids = Object.keys(want.Want);
          var messageIdParts = rumor.messageId.split(":");
          var rumorUuid = messageIdParts[0];
          var rumorSequence = messageIdParts[1];
          return rumorSequence > want.Want[rumorUuid];
        });
        userWithWant.rumors = userWithWant.rumors.concat(rumorsToAdd);
        userWithWant.save(function(err) {
          if (err) return reject(err);
          return resolve(rumorsToAdd)
        })
      })
    });
  });
};

exports.createRumorFromRumor = function(userId, rumor) {
  return new Promise(function(resolve, reject) {
    User.findById(userId, function(err, user) {
      if (err) return reject({ status: 500, message: err });
      if (!user) return reject({ status: 404, message: "Unable to get user" })
      var exists = user.rumors.filter(function(eaRumor) {
          return eaRumor.messageId === rumor.messageId
        }).length > 0;
      if (!exists) {
        user.rumors.push(rumor);
        user.save(function(err) {
          if (err) return reject(err);
          return resolve(rumor)
        })
      } else {
        return resolve(rumor)
      }
    });
  });
};

exports.createRumorFromMessage = function(userId, message) {
  return new Promise(function(resolve, reject) {
    User.findById(userId, function(err, user) {
      if (err) return reject({ status: 500, message: err });
      if (!user) return reject({ status: 404, message: "Unable to get user" });
      var text = message;
      var originator = user.username;
      var maxSequenceNum = maxSequenceNumber(user.rumors, user.uuid);
      var messageId = user.uuid + ":" + (maxSequenceNum + 1);
      var rumor = {
        Rumor: {
          messageId: messageId,
          originator: originator,
          text: text
        },
        EndPoint: user.nodeEndpoint
      };
      user.rumors.push(rumor);
      user.save(function(err) {
        if (err) return reject(err);
        return resolve(rumor)
      });
    });
  })
};

function resolveRumor(userId, rumor) {
  return new Promise(function(resolve, reject) {
    var resultPromise = null;
    User.findOne({ nodeEndpoint: rumor.EndPoint }, function(err, user) {
      if (err) return reject(err);
      if (!user) {
        var newUser = new User({
          name: rumor.Rumor.originator,
          username: rumor.Rumor.originator,
          seed: true,
          rumors: [rumor],
          nodeEndpoint: rumor.EndPoint,
          neighbors: [],
          uuid: rumor.Rumor.messageId.split(":")[0]
        });
        resultPromise = saveUser(newUser);
      } else {
        resultPromise = exports.createRumorFromRumor(userId, rumor);
      }
      resultPromise
      .then(resolve)
      .catch(reject)
    });
  });
}

exports.createRumorReq = function(req, res) {
  //if the message coming in is a rumor do something
  var rumor = req.body.rumor;
  var want = req.body.want;
  var userId = req.params.id;
  console.log("Getting user from id: " + userId);
  var resultPromise = null;
  if(rumor){
    resultPromise = resolveRumor(userId, rumor)
  } else if (want) {
    resultPromise = exports.resolveWant(userId, want);
  } else {
    console.log("Creating rumor...");
    console.log(req.body.message);
    resultPromise = exports.createRumorFromMessage(userId, req.body.message);
  }
  
  resultPromise
  .then(function(result) {
    res.status(200).json(result)
  })
  .catch(function(err) {
    res.status(500).json(err)
  })
};

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
    oauth_token : token
  };
  var URI = 'https://api.foursquare.com/v2/users/self/checkins';
  var query = "?oauth_token=" + token + '&v=20170214';
  var completeURI = URI + query;
  getCheckins(completeURI, req.param("id")).then(function(data) {
    console.log(data);
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
        var checkins = json.response.checkins;
        console.log(json);
        console.log(checkins);
        User.findById(id, function(err, user) {
          if (err) return reject({ error: err });
          user.checkins = checkins;
          resolve({user: user, checkins: checkins, json: json });
        })
      });
      
      resp.on("error", function(err) {
        reject(err)
      })
    })
  });
}

exports.addNeighborAndSave = function(newUser){
  console.log("Adding neighbor and saving");
  return new Promise(function(resolve, reject) {
    if (newUser.seed) {
      // Put all the other seeds as its neighbors and give me to them as a neighbor
      User.find({ seed: true }, function(err, users) {
        if (err) return reject(err);
        if (!users) return reject("Unable to get users.");
        
        var operations = [];
        users.forEach(function(user) {
          if (newUser._id != user._id) {
            if (user.neighbors.indexOf(newUser._id) == -1) {
              user.neighbors.push(newUser._id);
              operations.push(saveUser(user))
            }
            if (newUser.neighbors.indexOf(user._id) == -1) {
              //user not in neighbors
              newUser.neighbors.push(user._id);
              operations.push(saveUser(newUser))
            }
          }
        });
        
        Promise.all(operations)
        .then(function(results) {
          console.log(results);
          return resolve(results);
        })
        .catch(function(err) {
          console.error(err);
          return reject({ status: 500, err: err });
        })
      })
    } else {
      console.log("Not a seed");
      User.find({ seed: true}, function(err, users) {
        if (err) return reject({ status: 500, err: err });
        if (!users) return reject({ status: 404, err: "Unable to get users." })
        
        // Add one of the seeds as its neighbor
        if (users.length > 0) {
          var index = utils.getRandom(0, users.length);
          var user = users[index];
          console.log(index);
          console.log(users);
          newUser.neighbors.push(user._id);
          // The seed user will have this new user as a neighbor
          user.neighbors.push(newUser._id);
          
          Promise.all([
            saveUser(newUser),
            saveUser(user)
          ])
          .then(function(results) {
            console.log(results);
            return resolve(users);
          })
          .catch(function(err) {
            console.log(err);
            return reject({ status: 500, err: err });
          })
        } else {
          console.log("no seeds, default to seed");
          //if there are no seeds yet, default this guy to seed.
          newUser.seed = true;
          
          saveUser(newUser)
          .then(function(user) {
            return resolve(user);
          })
          .catch(function(err) {
            console.log(err);
            return reject({ status: 500, err: err });
          })
        }
      })
    }
  })
}

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.nodeEndpoint = "/api/users/" + this._id + "/rumors";
  newUser.uuid = uuid.v4();
  newUser.seed = utils.getRandom(0, 5) % 3 === 0;
  exports.addNeighborAndSave(newUser)
  .then(function(results) {
    console.log(results);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresIn: 60*5 });
    return res.status(200).json({ token: token });
  })
  .catch(function(errResult) {
    return res.status(errResult.status).json(errResult.err);
  })
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var username = req.params.username;
  
  User.findOne({username: username}, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.status(200).json(user);
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

exports.propagateRumors = function() {
  User.find({}, function(err, users) {
    users.forEach(function(user) {
      if (user.neighbors.length > 0 && user.rumors.length > 0) {
        var randomNeighborId = user.neighbors[utils.getRandom(0,user.neighbors.length)];
        const neighborUser = users.filter(function(neighbor) {
          return neighbor._id === randomNeighborId
        });
        if (utils.getRandom(0, 1) == 0) {
          // Prepare a rumor
          var randomRumor = user.rumors[utils.getRandom(0, user.rumors.length)];
          // exports.createRumorFromRumor(randomNeighborId, randomRumor)
          httpPost(neighborUser.nodeEndpoint, randomRumor)
          .catch(function(err) { console.error(err) })
        } else {
          // Prepare a want
          const Want = prepareWant(user);
          // exports.resolveWant(randomNeighborId, Want)
          httpPost(neighborUser.nodeEndpoint, Want)
          .catch(function(err) { console.error(err) })
        }
      }
    })
  })
};

function prepareWant(user) {
  var Want = {
    "Want": {},
    "EndPoint": user.nodeEndpoint
  };
  
  utils.uniqueItems(
    user.rumors.map(function(rumor) { return parseInt(rumor.messageId.split(":")[0]) })
  ).forEach(function(uuid) {
    Want.Want[uuid] = maxSequenceNumber(user.rumors, uuid);
  });
  
  return Want;
}

function saveUser(user) {
  return new Promise(function(resolve, reject) {
    user.save(function(err) {
      if (err) reject(err);
      else resolve(user);
    })
  });
}

function maxSequenceNumber(rumors, uuid) {
  return rumors
  .filter(function(rumor) { return rumor.messageId.split(":")[0] === uuid })
  .map(function(rumor) { return parseInt(rumor.messageId.split(":")[1]) })
  .reduce(function(a,b) { return Math.max(a,b); }, [])
}

function httpPost(url, body) {
  return new Promise(function(resolve, reject) {
    https.post(url, body, function(resp){
      resp.on("error", function(err) {
        return reject(err);
      });
      
      resp.on("end", function() {
        return resolve()
      });
    })
  })
}
