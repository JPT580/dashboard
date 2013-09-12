$(function() {

	$(".content-container-header").each(function() {
		$(this).css("background-color", "hsla(" + Math.round(Math.random() * 360) + ", 100%, 50%, 1);");
	});

	//setup the draggable content containers
	$(".content-container-bounding-box").draggable({
		"distance": 10,
		"handle": "h1",
		"helper": "clone",
		"revert": "invalid",
		"revertDuration": 50,
		"scope": "widget",
		"scroll": false,
		"snap": false,
		"start": function(event, ui) {
			//set width and height of dragged clone to originals dimensions
			$(ui.helper[0]).width(event.target.clientWidth).height(event.target.clientHeight);
			//change opacity of original to indicate it is being dragged
			$(event.target).css("opacity", "0.25");
			//also change opacity of dragged clone to help the user see
			$(ui.helper[0]).css("opacity", "0.5");
		},
		"stop": function(event, ui) {
			//reset opacity of original
			$(event.target).css("opacity", "");
		}
	});

	//setup the dropzones
	//put the dragged object into first position of a column
	$(".content-column").droppable({
		"greedy": false,
		"scope": "widget",
		"tolerance": "pointer",
		"drop": function(event, ui) {
			$("#draggable-temporary-clone").remove();
			$(ui.draggable[0]).prependTo($(event.target));
		},
		"over": function(event, ui) {
			$("#draggable-temporary-clone").remove();
			//create a placeholder and mark it with an id (so we can remove it later)
			$(".droppable-container-placeholder")
				.clone(true)
				.width(ui.draggable[0].clientWidth)
				.height(ui.draggable[0].clientHeight)
				.attr("id", "draggable-temporary-clone")
				.prependTo(event.target);
		},
		"out": function(event, ui) {
			$("#draggable-temporary-clone").remove();
		}
	});

	//put the dragged object into a slot after the object it was dropped on
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
			//create a placeholder and mark it with an id (so we can remove it later)
			$(".droppable-container-placeholder")
				.clone(true)
				.width(ui.draggable[0].clientWidth)
				.height(ui.draggable[0].clientHeight)
				.attr("id", "draggable-temporary-clone")
				.insertAfter(event.target);
		},
		"out": function(event, ui) {
			$("#draggable-temporary-clone").remove();
		}
	});

});