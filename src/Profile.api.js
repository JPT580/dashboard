var tools = require("./Tools.js");

var constructor = function(db) {
	var db = db;

	var handler = function(req, res) {
		res.setHeader("Content-Type", "application/json");

		//profile api available only with login
		if(req.session.data.login == false) {
			res.send(200, JSON.stringify({
				"success": false,
				"error": "You are not logged in!"
			}));
			return;
		}

		//overwrite existing profile data
		if(req.method == "PUT") {
			var params = req.body;
			if(tools.reqParamsGiven(["data"], params) == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "This method needs a data parameter!"
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
					var userDoc = {
						"_id": params.username,
						"auth": pwHash,
						"email": params.email,
						"type": "user"
					};
					db.save(userDoc._id, userDoc, function(err, result) {
						if(err) {
							console.log(err)
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
				});
			});
		}

		if(req.method == "GET") {
			res.send(200, JSON.stringify({
				"success": true,
				"profile": req.session.data.profile
			}));
		}

		if(req.method == "POST") {
			var params = req.body;
			var changeset = {
				"data": req.body.profile
			};
			db.merge(req.session.data.user.profile, changeset, function(err, result) {
				if(err) {
					console.log(err);
					res.send(200, JSON.stringify({
						"success": false,
						"error": "Something went wrong updating the profile document!"
					}));
				} else {
					res.send(200, JSON.stringify({
						"success": true
					}));
				}
			});
		}

		if(req.method == "DELETE") {
			//check if user document exists
			db.get(req.session.data.user._id, function (err, doc) {
				if(err && err.error == "not_found") {
					console.log(err);
					res.send(200, JSON.stringify({
						"success": false,
						"error": "User document does not exist!"
					}));
					return;
				}
				var userDocument = doc;
				db.remove(userDocument._id, userDocument._rev, function(err, result) {
					if(err) {
						console.log(err);
						res.send(200, JSON.stringify({
							"success": false,
							"error": "Could not delete user document!"
						}));
					} else {
						db.get(userDocument.profile, function(err, doc) {
							if(err) {
								console.log(err);
								res.send(200, JSON.stringify({
									"success": false,
									"error": "Could not fetch profile document!"
								}));
							} else {
								var profileDocument = doc;
								db.remove(profileDocument._id, profileDocument._rev, function(err, result) {
									if(err) {
										console.log(err);
										res.send(200, JSON.stringify({
											"success": false,
											"error": "Could not delete profile document!"
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
					}
				});
			});
		}
	};

	return handler;
};

module.exports = constructor;