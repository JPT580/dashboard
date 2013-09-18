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
			if(tools.reqParamsGiven(["profile"], params) == false) {
				res.send(200, JSON.stringify({
					"success": false,
					"error": "This method needs a profile parameter!"
				}));
				return;
			}
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

		if(req.method == "GET") {
			db.get(req.session.data.user.profile, function(err, doc) {
				if(err) {
					console.log(err);
					res.send(200, JSON.stringify({
						"success": false,
						"error": "Something went wrong reading the profile document!"
					}));
				} else {
					req.session.data.profile = doc.data;
					res.send(200, JSON.stringify({
						"success": true,
						"profile": req.session.data.profile
					}));
				}
			});
		}

		if(req.method == "DELETE") {
			db.get(req.session.data.user.profile, function(err, doc) {
				if(err) {
					console.log(err);
					res.send(200, JSON.stringify({
						"success": false,
						"error": "Could not fetch old profile document!"
					}));
					return;
				}
				//delete profile document
				db.remove(doc._id, doc._rev, function(err, result) {
					if(err) {
						console.log(err);
						res.send(200, JSON.stringify({
							"success": false,
							"error": "Could not remove old profile document!"
						}));
						return;
					}
					//create new profile document
					db.save({
						"type": "profile",
						"data": {}
					}, function(err, result) {
						if(err) {
							console.log(err);
							res.send(200, JSON.stringify({
								"success": false,
								"error": "Could not create new profile document!"
							}));
							return;
						}
						//update profile id value in user document
						var newProfileDocument = result;
						var changeset = {
							"profile": newProfileDocument.id
						};
						db.merge(req.session.data.user._id, changeset, function(err, result) {
							if(err) {
								console.log(err);
								res.send(200, JSON.stringify({
									"success": false,
									"error": "Could not update user document!"
								}));
								return;
							}
							db.get(req.session.data.user._id, function(err, doc) {
								if(err) {
									console.log(err);
									res.send(200, JSON.stringify({
										"success": false,
										"error": "Could not re-read user document!"
									}));
									return;
								}
								//update profile id in session data.
								req.session.data.user.profile = newProfileDocument.id;
								//send response
								res.send(200, JSON.stringify({
									"success": true
								}));
							});
						});
					});
				});
			});
		}
	};

	return handler;
};

module.exports = constructor;