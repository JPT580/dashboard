var async = require("async");
var cradle = require("cradle");
var express = require("express");
var fs = require("fs");
var http = require("http");
var https = require("https");
var log4js = require("log4js");

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
app.use(function(req, res, next) {
	console.log("%s %s", req.method, req.url);
	next();
});

//deliver static files by default
app.use(express.static(__dirname + '/static'));

//serve random fun stuff on /ohai ;-)
app.use("/ohai", function(req, res) {
	res.send("ohai!");
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
	https.createServer(httpsOptions, app).listen(settings.general.listen);
} else {
	http.createServer(app).listen(settings.general.listen);
}