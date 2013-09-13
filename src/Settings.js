var fs = require("fs");
var vm = require("vm");

var settingsFilename = "settings.json";

settingsString = fs.readFileSync(settingsFilename).toString();

var settings;
try {
	if(settingsString) {
		settings = vm.runInContext("exports = " + settingsString, vm.createContext(), settingsFilename);
		settings = JSON.parse(JSON.stringify(settings)); //fix objects having constructors of other vm.context
	}
} catch(e) {
	console.error("There was an error processing the settings.json file: " + e.message);
	process.exit(1);
}

module.exports = settings;