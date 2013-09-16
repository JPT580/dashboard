var scrypt = require("scrypt");
var tools = require("./Tools.js");

var constructor = function(db) {
	var db = db;

	var handler = function(req, res) {
		res.setHeader("Content-Type", "application/json");

		if(req.method == "PUT") {
			var params = req.body;
			if(tools.reqParamsGiven(["username", "password", "email"], params) == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"err": "This method needs username, password and email!"
				}));
				return;
			}
			//check if user already exists
			db.get(params.username, function (err, doc) {
				if(!err || err.error != "not_found" || err.reason != "missing") {
					res.send(200, JSON.stringify({
						"success": false,
						"err": "Username already taken!"
					}));
					return;
				}
				scrypt.passwordHash(params.password, 10, function(err, pwHash) {
					var userDoc = {
						"_id": params.username,
						"auth": pwHash,
						"email": params.email,
						"type": "user"
					};
					db.save(userDoc._id, userDoc, function(err, result) {
						if(err) {
							res.send(200, JSON.stringify({
								"success": false,
								"err": err
							}));
						} else {
							res.send(200, JSON.stringify({
								"success": true
							}));
						}
					});
				});
			});
		}

		if(req.method == "GET") {
			if(req.session.data.login == true) {
				res.send(200, JSON.stringify({
					"success": true,
					"data": req.session.data.user
				}));
			} else {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "You are not logged in!"
				}));
			}
		}

		if(req.method == "POST") {
			console.log(req);
		}

		if(req.method == "DELETE") {
			//verify credentials before erasing all data
			console.log(req);
		}
	};

	return handler;
};

module.exports = constructor;