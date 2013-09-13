var express = require("express");
var http = require("http");
var https = require("https");
var fs = require("fs");

var app = express();

app.use(function(req, res, next) {
	console.log("%s %s", req.method, req.url);
	next();
});

//deliver static files by default
app.use(express.static(__dirname + '/static'));

app.use("/ohai", function(req, res) {
	res.send("ohai!");
});


app.use(function(req, res) {
	res.status(404).send("Sorry, nothing here.");
});

//http.createServer(app).listen(3000);

var httpsOptions = {
	"key": fs.readFileSync("snakeoil/privkey.pem"),
	"cert": fs.readFileSync("snakeoil/cert.pem")
};
https.createServer(httpsOptions, app).listen(3000);
