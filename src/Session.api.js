var scrypt = require("scrypt");
var tools = require("./Tools.js");

var constructor = function(db) {
	var db = db;

	var handler = function(req, res) {
		res.setHeader("Content-Type", "application/json");

		//refresh session and return login status
		if(req.method == "GET") {
			if(req.session.data.login == true) {
				if(new Date() - new Date(req.session.data.lastActivity) < 5 * 60 * 1000) {
					req.session.data.lastActivity = new Date().toString();
				} else {
					req.session.data.login = false;
				}
			}
			res.send(200, JSON.stringify({
				"success": true,
				"login": req.session.data.login
			}));
		}

		//check user credentials, update session data
		if(req.method == "PUT") {
			//already logged in?
			if(req.session.data.login == true) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "You are already logged in!"
				}));
				return;
			}

			var params = req.body;
			//username or password missing?
			if(tools.reqParamsGiven(["username", "password"], params) == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "Insufficient parameters given! Need: username, password"
				}));
				return;
			}
			//check if user exists
			db.get(params.username, function (err, doc) {
				console.log(["dbgetuser", arguments]);
				if(!err && doc.type == "user") {
					var userDocument = doc;
					//user exists, verify password
					scrypt.verifyHash(userDocument.auth, params.password, function(err, match) {
						if(err || match == false) {
							res.send(200, JSON.stringify({
								"success": false,
								"error": "Invalid login credentials!"
							}));
							return;
						}
						if(!err && match == true) {
							req.session.data.user = userDocument;
							req.session.data.login = true;
							req.session.data.lastActivity = new Date().toString();
							res.send(200, JSON.stringify({
								"success": true
							}));
							return;
						}
					});
				} else {
					//user does not exist.
					res.send(200, JSON.stringify({
						"success": false,
						"error": "Invalid login credentials!"
					}));
					return;
				}
			});
		}

		//destroy the session
		if(req.method == "DELETE") {
			//only do logout if login exists
			if(req.session.data.login == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "Cannot log you out, you are not logged in!"
				}));
			} else {
				req.session.data.login = false;
				res.send(200, JSON.stringify({
					"success": true
				}));
			}
		}
	};

	return handler;
};

module.exports = constructor;