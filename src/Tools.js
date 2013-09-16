//check whether all given params exist in an object
//var success = .reqParamsGiven(["username", "password"], req.body);
exports.reqParamsGiven = function (keys, obj) {
	if(typeof(obj) != "object" || obj.length < 1) return false;
	for(k in keys) {
		var key = keys[k];
		var value = obj[key];
		if(value == undefined) {
			return false;
		}
		if(typeof(value) == "string" && value == "") {
			return false;
		}
	}
	return true;
}