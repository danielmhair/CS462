var fs = require('fs');
var http = require('http');
var url = require('url');
var readline = require('readline');
var ROOT_DIR = "html/";
var MongoClient = require('mongodb').MongoClient;
var port = 8080;
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  // If this is our comments REST service
  if(urlObj.pathname.indexOf("comment") !=-1) {
    console.log("comment route");
    if(req.method === "POST") {
      console.log("POST comment route");
      // First read the form data
      var jsonData = "";
      req.on('data', function (chunk) {
        jsonData += chunk;
      });
      req.on('end', function () {
        var reqObj = JSON.parse(jsonData);
        console.log("Name: "+reqObj.Name);
        console.log("Comment: "+reqObj.Comment);
        
        console.log("Putting into the database");
        MongoClient.connect("mongodb://localhost/comments", function(err, db) {
          if(err) throw err;
          db.collection('comments').insert(reqObj,function(err, records) {
            console.log("Record added as "+records[0]._id);
            res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com" });
            res.end("");
          });
        });
      });
    } else if(req.method === "GET") {
      // Read all of the database entries and return them in a JSON array
      MongoClient.connect("mongodb://localhost/comments", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr){
              console.log(itemArr);
              res.writeHead(200, { "Access-Control-Allow-Origin": "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com" });
              res.end(JSON.stringify(itemArr));
            });
          });
        });
      });
    }
  } else {
   // Normal static file
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}).listen(port);
console.log("Listening on port " + port);