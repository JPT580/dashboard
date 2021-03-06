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
					"error": "This method needs username, password and email!"
				}));
				return;
			}
			//check if user already exists
			db.get(params.username, function (err, doc) {
				if(!err || err.error != "not_found") {
					res.send(200, JSON.stringify({
						"success": false,
						"error": "Username already taken!"
					}));
					return;
				}
				scrypt.passwordHash(params.password, 10, function(err, pwHash) {
					var profileDoc = {
						"type": "profile",
						"data": {}
					}
					db.save(profileDoc, function(err, result) {
						if(err) {
							console.log(err);
							res.send(200, JSON.stringify({
								"success": false,
								"error": "Could not create profile document!"
							}));
						} else {
							var profileID = result.id;
							var userDoc = {
								"_id": params.username,
								"auth": pwHash,
								"email": params.email,
								"profile": profileID,
								"type": "user"
							};
							db.save(userDoc._id, userDoc, function(err, result) {
								if(err) {
									console.log(err);
									res.send(200, JSON.stringify({
										"success": false,
										"error": "Could not create user document!"
									}));
								} else {
									res.send(200, JSON.stringify({
										"success": true
									}));
								}
							});
						}
					});
				});
			});
		}

		if(req.method == "GET") {
			if(req.session.data.login == true) {
				res.send(200, JSON.stringify({
					"success": true,
					"user": req.session.data.user
				}));
			} else {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "You are not logged in!"
				}));
			}
		}

		if(req.method == "POST") {
			var params = req.body;
			if(req.session.data.login == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "You are not logged in!"
				}));
				return;
			}
			var changeset = {};
			//TODO: implement to ignore underscore attributes and type field!
			if(tools.reqParamsGiven(["email"], params) != false) {
				changeset["email"] = params["email"];
			}
			if(tools.reqParamsGiven(["password"], params) != false) {
				//TODO: make this async!
				changeset["auth"] = scrypt.passwordHashSync(params["password"], 10);
			}
			db.merge(req.session.data.user._id, changeset, function(err, result) {
				if(err) {
					console.log(err);
					res.send(200, JSON.stringify({
						"success": false,
						"error": "Something went wrong updating the user document!"
					}));
				} else {
					db.get(req.session.data.user._id, function(err, result) {
						if(err) {
							console.log(err);
							res.send(200, JSON.stringify({
								"success": false,
								"error": "Something went wrong re-reading the user document!"
							}));
						} else {
							req.session.data.user = result;
							res.send(200, JSON.stringify({
								"success": true
							}));
						}
					});
				}
			});
		}

		if(req.method == "DELETE") {
			if(req.session.data.login == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "You are not logged in!"
				}));
				return;
			}
			//check if user document exists
			db.get(req.session.data.user._id, function (err, doc) {
				if(err && err.error == "not_found") {
					res.send(200, JSON.stringify({
						"success": false,
						"error": "User document does not exist!"
					}));
					return;
				}
				var userDoc = doc;
				db.remove(userDoc.profile, function(err, result) {
					if(err) {
						res.send(200, JSON.stringify({
							"success": false,
							"error": "Could not delete profile document!"
						}));
					} else {
						db.remove(userDoc._id, userDoc._rev, function(err, result) {
							if(err) {
								res.send(200, JSON.stringify({
									"success": false,
									"error": "Could not delete user document!"
								}));
							} else {
								//kill session data, too
								delete req.session;
								res.send(200, JSON.stringify({
									"success": true
								}));
							}
						});
					}
				});
			});
		}
	};

	return handler;
};

module.exports = constructor;