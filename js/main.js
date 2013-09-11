$(function() {
	//setup the draggable content containers
	$(".content-container-bounding-box").draggable({
		"distance": 10,
		"handle": "h1",
		"helper": "clone",
		"revert": "invalid",
		"revertDuration": 50,
		"scope": "widget",
		"scroll": false,
		"snap": true,
		"start": function(event, ui) {
			//set width and height of dragged clone to originals dimensions
			$(ui.helper[0]).width(event.target.clientWidth).height(event.target.clientHeight);
			//change opacity of original to indicate it is being dragged
			$(event.target).css("opacity", "0.3");
			//also change opacity of dragged clone to help the user see
			$(ui.helper[0]).css("opacity", "0.3");
		},
		"stop": function(event, ui) {
			//reset opacity of original
			$(event.target).css("opacity", "");
		}
	});

	//setup the dropzones
	$(".content-column").droppable({
		"greedy": false,
		"scope": "widget",
		"tolerance": "pointer",
		"drop": function(event, ui) {
			$("#draggable-temporary-clone").remove();
			$(ui.draggable[0]).prependTo(event.target);
		},
		"over": function(event, ui) {
			$("#draggable-temporary-clone").remove();
			$(ui.draggable[0]).clone(true).attr("id", "draggable-temporary-clone").prependTo(event.target);
		},
		"out": function(event, ui) {
			$("#draggable-temporary-clone").remove();
		}
	});

	$(".content-container-bounding-box").droppable({
		"greedy": true,
		"scope": "widget",
		"tolerance": "pointer",
		"drop": function(event, ui) {
			$("#draggable-temporary-clone").remove();
			$(ui.draggable[0]).insertAfter(event.target);
		},
		"over": function(event, ui) {
			$("#draggable-temporary-clone").remove();
			$(ui.draggable[0]).clone(true).attr("id", "draggable-temporary-clone").insertAfter(event.target);
		},
		"out": function(event, ui) {
			$("#draggable-temporary-clone").remove();
		}
	});

});