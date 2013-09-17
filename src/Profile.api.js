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
			var changeset = {
				"data": {}
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
	};

	return handler;
};

module.exports = constructor;