(function($) {
	//define dashboard namespace
	$.dashboard = {};
	$.fn.dashboard = {};

	//wrap ajax method
	function ajax(method, url, data, callback) {
		$.ajax({
			"async": true,
			"cache": false,
			"data": data,
			"type": method,
			"url": url
		})
		.always(function(data, textStatus, jqXHR) {
			if(textStatus == "success") {
				callback(data);
			} else {
				console.error(["ajaxResult", arguments]);
			}
		});
	}

	$.dashboard.doLogin = function(username, password, callback) {
		if(arguments.length < 2 || username == "" || password == "") {
			throw {"error": "username or password is empty!"};
		}
		ajax("PUT", "/session", {
			"username": username,
			"password": password
		}, function(data) {
			if(typeof(callback) == "function") callback(data);

		});
	};

	$.dashboard.doLogout = function(callback) {
		ajax("DELETE", "/session", null, function(data) {
			if(typeof(callback) == "function") callback(data);
		});
	};

	$.dashboard.getLogin = function(callback) {
		ajax("GET", "/session", null, function(data) {
			if(typeof(callback) == "function") callback(data);
		});
	};

	$.dashboard.createUser = function(username, password, callback) {
		ajax("PUT", "/user", {
			"username": username,
			"password": password
		}, function(data) {
			if(typeof(callback) == "function") callback(data);
		});
	};

	$.dashboard.getUser = function(callback) {
		ajax("GET", "/user", null, function(data) {
			if(typeof(callback) == "function") callback(data);
		});
	};

	$.dashboard.updateUser = function(data, callback) {
		ajax("POST", "/user", data, function(data) {
			if(typeof(callback) == "function") callback(data);
		});
	};

	$.dashboard.deleteUser = function(username, password, callback) {
		ajax("DELETE", "/user", {
			"username": username,
			"password": password
		}, function(data) {
			if(typeof(callback) == "function") callback(data);
		});
	};

})(jQuery);