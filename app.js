var async = require("async");
var cradle = require("cradle");
var express = require("express");
var fs = require("fs");
var http = require("http");
var https = require("https");
var log4js = require("log4js");
var scrypt = require("scrypt");

//load own tools (tiny functions that help a little ;-)
var tools = require("./src/Tools.js");

//load settings
var settings = require("./src/Settings.js");

//initialize couch connector
cradle.setup(settings.couchdb);
var couch = new(cradle.Connection);
var db = couch.database(settings.couchdb.database);

db.exists(function(err, exists) {
	if(err) {
		console.log("An error occured - could not talk to couchdb:");
		console.log(err);
		process.exit(1);
	} else if(exists == true) {
		console.log("Database exists :-)");
	} else {
		console.log("Database does not exist :-(");
		process.exit(1);
	}
});

//begin setting up the dashboard app
var app = express();
app.use(express.cookieParser());
app.use(express.session({
	"secret": settings.general.sessionsecret
}));
app.use(express.bodyParser());

//some logging for debugging
app.use(function(req, res, next) {
	console.log("%s %s", req.method, req.url);
	next();
});

//initialize fresh session
app.use(function(req, res, next) {
	if(req.session.initialized != true) {
		req.session.initialized = true;
		req.session.data = {
			"user": null,
			"profile": {},
			"login": false,
			"lastActivity": new Date()
		};
	}
	console.log(["Session Data", req.session.data]);
	next();
});

//deliver static files by default
app.use("/", express.static(__dirname + '/static'));

//API: /session
app.use("/session", function(req, res) {
	res.setHeader("Content-Type", "application/json");

	//refresh session and return login status
	if(req.method == "GET") {
		if(req.session.data.login == true) {
			if(new Date() - req.session.data.lastActivity < 5 * 60 * 1000) {
				req.session.data.lastActivity = new Date();
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
			if(!err && doc.type == "user") {
				//user exists, verify password
				scrypt.verifyHash(user.auth, params.password, function(err, match) {
					if(err || match == false) {
						res.send(200, JSON.stringify({
							"success": false,
							"error": "Invalid login credentials!"
						}));
						return;
					}
					if(!err && match == true) {
						req.session.data.login = true;
						req.session.data.lastActivity = new Date();
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
});

//API: /user
app.use("/user", function(req, res) {
	res.setHeader("Content-Type", "application/json");
	if(req.method == "PUT") {
		var params = req.body;
		if(tools.reqParamsGiven(["username", "password", "email"], params) == false) {
			res.send(500, JSON.stringify({
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
			//get: {"0":{"error":"not_found","reason":"missing"}}
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
		res.send(200, JSON.stringify(req.session.data.user));
	}
	if(req.method == "POST") {
		console.log(req);
	}
	if(req.method == "DELETE") {
		//verify credentials before erasing all data
		console.log(req);

	}
});

//define 404 for everything else or 500 on error (ugly but i think it's useful)
app.use(function(err, req, res, next) {
	if(err) {
			console.log(err.stack);
			res.send(500, "Oops, an error occured.");
	} else {
		res.send(404, "Sorry, nothing here.");
	}
	res.end();
});

//fire it up as https (or http - NOT recommended(!)) server
if(settings.general.https == true) {
	var httpsOptions = {
		"cert": fs.readFileSync(settings.https.cert),
		"key": fs.readFileSync(settings.https.key)
	};
	https.createServer(httpsOptions, app).listen(settings.general.listen.port, settings.general.listen.host);
} else {
	http.createServer(app).listen(settings.general.listen.port, settings.general.listen.host);
}