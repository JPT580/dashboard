var async = require("async");
var cradle = require("cradle");
var express = require("express");
var fs = require("fs");
var http = require("http");
var https = require("https");
var log4js = require("log4js");
var scrypt = require("scrypt");

//load settings
var settings = require("./src/Settings.js");

//initialize couch connector
cradle.setup(settings.couchdb);
var couch = new(cradle.Connection);
var db = couch.database(settings.couchdb.database);

db.exists(function(err, exists) {
	if(err) {
		console.log(err);
		process.exit(1);
	} else if(exists == true) {
		console.log("Database exists :-)");
	} else {
		console.log("Database does not exist!");
		process.exit(1);
	}
});

//begin setting up the dashboard app
var app = express();
app.use(express.cookieParser());
app.use(express.session({
	"secret": settings.general.sessionsecret
}));

//some logging for debugging
app.use(function(req, res, next) {
	console.log("%s %s", req.method, req.url);
// 	console.log(["Session", req.session]);
	next();
});

//initialize fresh session
app.use(function(req, res, next) {
	if(req.session.initialized != true) {
		req.session.initialized = true;
		req.session.login = false;
	}
	next();
});

//deliver static files by default
app.use(express.static(__dirname + '/static'));

//API: /session
app.use("/session", function(req, res) {
	res.setHeader("Content-Type", "application/json");

	//refresh session
	if(req.method == "GET") {
		if(req.session.login == true) {
			if(new Date() - req.session.lastActivity < 5 * 60 * 1000) {
				req.session.lastActivity = new Date();
			} else {
				req.session.login = false;
			}
		res.send(200, JSON.stringify({
			"login": req.session.login
		}));
	}

	//check user credentials, update session data
	if(req.method == "PUT") {
		//TODO: implement proper login mechanism
		req.session.login = true;
		req.session.lastActivity = new Date();
		res.send(200, JSON.stringify({
			"login": req.session.login
		}));
	}

	//destroy the session
	if(req.method == "DELETE") {
		req.session.login = false;
		res.send(200, JSON.stringify({
			"login": req.session.login
		}));
	}
});

//define 404 for everything else (ugly but i think it's useful)
app.use(function(req, res) {
	res.status(404).send("Sorry, nothing here.");
});

//fire it up as https (or http) server
if(settings.general.https == true) {
	var httpsOptions = {
		"cert": fs.readFileSync(settings.https.cert),
		"key": fs.readFileSync(settings.https.key)
	};
	https.createServer(httpsOptions, app).listen(settings.general.listen.port, settings.general.listen.host);
} else {
	http.createServer(app).listen(settings.general.listen.port, settings.general.listen.host);
}