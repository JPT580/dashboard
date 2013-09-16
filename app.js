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

//load api handler
var sessionAPIHandler = require("./src/Session.api.js");
var userAPIHandler = require("./src/User.api.js");

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
			"lastActivity": new Date().toString()
		};
	}
	console.log(["Session Data", req.session.data]);
	next();
});

//deliver static files by default
app.use("/", express.static(__dirname + '/static'));

//API: /session
app.use("/session", new sessionAPIHandler(db));

//API: /user
app.use("/user", new userAPIHandler(db));

//'automatic' error handling and/or responding to non-implemented http calls
//i know this is ugly as hell, but it might stay for a while.
app.use(function(err, req, res, next) {
	if(err) {
			console.log(err.stack);
			res.send(500, "Oops, an error occured.");
	} else {
		res.send(501, "Method not implemented");
	}
	res.end();
});

//define listening callback function
var onListenCallback = function() {
	var url = "";
	url += (settings.general.https) ? "https://" : "http://";
	url += settings.general.listen.host;
	if((settings.general.https && settings.general.listen.port != 443) || (!settings.general.https && settings.general.listen.port != 80)) {
		url += ":";
		url += settings.general.listen.port;
	}
	url += "/";
	console.log("Dashboard now listening on: " + url);
	console.log("Enjoy! ;-)");
}

//fire it up as https (or http - NOT recommended(!)) server
if(settings.general.https == true) {
	var httpsOptions = {
		"cert": fs.readFileSync(settings.https.cert),
		"key": fs.readFileSync(settings.https.key)
	};
	https.createServer(httpsOptions, app).listen(settings.general.listen.port, settings.general.listen.host, onListenCallback);
} else {
	http.createServer(app).listen(settings.general.listen.port, settings.general.listen.host, onListenCallback);
}
