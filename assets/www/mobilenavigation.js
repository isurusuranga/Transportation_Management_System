$.mobile.page.prototype.options.domCache = true;

// Marker images to mark the source, destination and intermediate tracking nodes
var mGreen = new google.maps.MarkerImage(
		'http://www.geocodezip.com/mapIcons/marker_green.png',
		new google.maps.Size(27, 27), new google.maps.Point(0, 0),
		new google.maps.Point(13, 27));

var mRed = new google.maps.MarkerImage(
		'http://www.geocodezip.com/mapIcons/marker_red.png',
		new google.maps.Size(27, 27), new google.maps.Point(0, 0),
		new google.maps.Point(13, 27));

var mBus = new google.maps.MarkerImage(
		'http://maps.google.com/mapfiles/kml/shapes/bus.png	',
		new google.maps.Size(27, 27), new google.maps.Point(0, 0),
		new google.maps.Point(13, 27));

var dirRequests = null;
var resultsQ = null;

// image icons
var pinIcons = null;
var type = null; //type of the public places

var iconBase = './images/';
var icons = {
	atm : {
		icon : iconBase + 'atm.png'
	},
	bank : {
		icon : iconBase + 'bank.png'
	},
	bar : {
		icon : iconBase + 'bar.png'
	},
	cafe : {
		icon : iconBase + 'coffee.png'
	},
	food : {
		icon : iconBase + 'fastfood.png'
	},
	hospital : {
		icon : iconBase + 'hospital.png'
	},
	police : {
		icon : iconBase + 'police2.png'
	},
	store : {
		icon : iconBase + 'deptstore.png'
	},
	school : {
		icon : iconBase + 'school.png'
	},
	university : {
		icon : iconBase + 'university.png'
	},
	art_gallery : {
		icon : iconBase + 'artgallery.png'
	}
};

// Show the map information on the Mobile Phone
$(document).live("pageshow", "#map_page", function() {
	initialize();
});

$(document).live("pagecreate", "#map_page", function() {
	$('#submit').click(function() {
		calculateRoute();
		$('#directionpath').removeClass('ui-disabled');
		return false;
	});
	$('#home').click(function() {
		$('#directionpath').addClass('ui-disabled');
		initialize();
	});
	$('#button1').click(function() {
		findPlaces();
		return false;
	});
});

var directionDisplay;
var directionsService = new google.maps.DirectionsService(); //get services from google maps
var map;	//declare a variable to hold the map 
var mapCenter; //set the geoLocation of a default point

// Initialize the map
function initialize() {

	mapCenter = new google.maps.LatLng(6.927079000000001, 79.861243);

	var myOptions = {
		zoom : 13,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		center : mapCenter
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

}

function showDirections(dirResult, dirStatus) {

	directionDisplay = new google.maps.DirectionsRenderer({
		polylineOptions : getColor()
	});

	if (dirStatus == google.maps.DirectionsStatus.OK) {
		directionDisplay.setMap(map);
		directionDisplay.setPanel(document.getElementById("directions"));
		directionDisplay.setDirections(dirResult);
		console.log(dirResult);
	}

}

// Randomly change the color
function getColor() {
	var polylineOptionsPlan = {
		strokeColor : '#' + Math.floor(Math.random() * 16777215).toString(16),
		strokeOpacity : 1.0,
		strokeWeight : 5
	};
	return polylineOptionsPlan;
}

// auto zooming the appropriate area in event handeling feature
function showonmap(index) {

	var latLngIni = new google.maps.LatLng(6.927079000000001, 79.861243);
	map = new google.maps.Map(document.getElementById("map_canvas"), {
		zoom : 13,
		center : latLngIni,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	});
	directionsService.route(dirRequests[index], showDirections);
	$('[id*=row_]').removeClass('active_tr');
	$('#row_' + index).addClass('active_tr');

	var x = '';
	x += "<div class='result_box'><img src='https://maps.google.com/mapfiles/kml/shapes/bus.png' width='24' height='24'/><a href='#' id='busresult' onclick='showonmap("
			+ index + ")' >Result " + (index + 1) + "</a></div><br/>";

	var waypts = [];
	if (resultsQ[index].con_nodes) {
		for (z = 0; z < resultsQ[index].con_nodes.length; z++) {
			waypts.push({
				location : resultsQ[index].con_nodes[z] + " Bus Stop",
				stopover : true
			});
		}
	}

	// go through nav
	for (j = 0; j < resultsQ[index].nav.length; j++) {
		if (!resultsQ[index].nav[j].from)
			continue;
		x += "Navigation Details from <b>" + resultsQ[index].nav[j].from
				+ "</b> to <b>" + resultsQ[index].nav[j].to + "</b><br/>";

		for (k = 0; k < resultsQ[index].nav[j].opt.length; k++) {
			x += "Route-No-><a href='#' id='routeNo' onclick='getRouteDetails("
					+ resultsQ[index].nav[j].opt[k].route + ")'>"
					+ resultsQ[index].nav[j].opt[k].route + "</a> and Cost->"
					+ resultsQ[index].nav[j].opt[k].cost + "<br/>";

		}
		x += "<br/>";

	}
	$('#bus_results_details').html(x);
	// push requests
	if (resultsQ[index].isDirect) {
		dirRequests.push({
			origin : fromStr + " , sri lanka",
			destination : toStr + " , sri lanka",
			travelMode : google.maps.DirectionsTravelMode.DRIVING,
			unitSystem : 1,
			optimizeWaypoints : false,
			departure_time : new Date().getTime(),
			provideRouteAlternatives : false
		});
	} else {
		dirRequests.push({
			origin : fromStr + " , sri lanka",
			destination : toStr + " , sri lanka",
			waypoints : waypts,
			optimizeWaypoints : false,
			travelMode : google.maps.DirectionsTravelMode.DRIVING,
			unitSystem : 1,
			provideRouteAlternatives : false
		});
	}

}

// Visible the route details in different tab menues
function getRouteDetails(route) {
	$('#route_details').html('Please be waiting until information loading...');
	// $('#myTab a:last').tab('show');
	var request = $.ajax({
		//http://localhost/code/ajax_root_details.php
		url : "http://97.74.249.172/colomborider/code/ajax_root_details.php",
		type : "GET",
		data : {
			root : route
		},
		dataType : "html"
	});

	request.done(function(msg) {
		var x = '';
		obj = JSON.parse(msg);

		var isDirect = obj.isDirect;
		var connNodes = obj.connectedNodes;

		if (obj.error) {
			alert(obj.error);
			return;
		} else {
			x += "<div class='suggest_box'><div class='result_box'><b><u>"
					+ obj.routeno + " Details</u></b></div><br>";
			x += "Start Time:" + obj.StartTime + "<br>";
			x += "Finish Time:" + obj.FinishTime + "<br>";
			x += "AverageWaitingTime:" + obj.AverageWaitingTime + "<br>";
			x += "PeakTime:" + obj.PeakTime + "<br>";
			x += "AvailableBusTypes:" + obj.AvailableBusTypes + "<br></div>";
		}
		$('#route_details').html(x);
		// $('#myTab a:last').tab('show');
	});
}

// Find All Possible Paths to Reach from Source to Destination
function calculateRoute() {
	var selectedMode = $("#mode").val();
	var start = $("#from").val();
	var end = $("#to").val();

	$("#results").html();

	/*
	 * var latLngIni = new google.maps.LatLng(6.927079000000001, 79.861243); map =
	 * new google.maps.Map(document.getElementById("map_canvas"), { zoom: 13,
	 * center: latLngIni, mapTypeId: google.maps.MapTypeId.ROADMAP });
	 */

	if (start == '' || end == '') {
		$("#results").hide();
		alert("Either Source or Destination Can't identify");
		return;
	} else {

		if (selectedMode == 'TRANSIT') {
			$('#bus-result-container').html('Loading...');
			$('#results').hide();
			$('#bus-result').show();
			var request = $.ajax({
				//http://localhost/code/search.php
				url : "http://97.74.249.172/colomborider/code/search.php",
				type : "POST",
				data : {
					source : start,
					destination : end
				},
				dataType : "html"
			});

			request
					.done(function(msg) {
						var x = '';
						obj = JSON.parse(msg);

						var isDirect = obj.isDirect;
						var connNodes = obj.connectedNodes;

						if (obj.error) {
							alert(obj.error);
							return;
						} else {
							x += "<b>" + start + " to " + end + "</b><br>";
						}

						dirRequests = new Array();
						resultsQ = obj.results; // save results

						x += "<div class='suggest_box'>";
						x += "Suggested routes:<br/><table width='100%'>";

						for (i = 0; i < obj.results.length; i++) {
							// go through nav
							var cost = 0;
							for (j = 0; j < obj.results[i].nav.length; j++) {
								if (!obj.results[i].nav[j].from)
									continue;

								for (k = 0; k < obj.results[i].nav[j].opt.length; k++) {
									cost += parseFloat(obj.results[i].nav[j].opt[k].cost);
								}

							}
							x += "<tr id='row_"
									+ i
									+ "'><td><img src='https://maps.google.com/mapfiles/kml/shapes/bus.png' width='24' height='24'/><a href='#' id='routecost' onclick='showonmap("
									+ i + ")' >Result " + (i + 1)
									+ " Cost:LKR " + cost + "</a></td></tr>";
						}
						x += "</table></div><br/>";

						for (i = 0; i < obj.results.length; i++) {

							var waypts = [];
							if (obj.results[i].con_nodes) {
								for (z = 0; z < obj.results[i].con_nodes.length; z++) {
									waypts.push({
										location : obj.results[i].con_nodes[z]
												+ " Bus Stop",
										stopover : true
									});
								}
							}

							// push requests
							if (obj.results[i].isDirect) {
								dirRequests
										.push({
											origin : start + " , sri lanka",
											destination : end + " , sri lanka",
											travelMode : google.maps.DirectionsTravelMode.DRIVING,
											unitSystem : 1,
											optimizeWaypoints : false,
											departure_time : new Date()
													.getTime(),
											provideRouteAlternatives : false
										});
							} else {
								dirRequests
										.push({
											origin : start + " , sri lanka",
											destination : end + " , sri lanka",
											waypoints : waypts,
											optimizeWaypoints : false,
											travelMode : google.maps.DirectionsTravelMode.DRIVING,
											unitSystem : 1,
											provideRouteAlternatives : false
										});
							}

						}// end of loop results

						$("#bus-result-container").css('background', 'white');
						$("#bus-result-container").css('padding', '5px');
						$("#bus-result-container")
								.html(
										x
												+ "<div id='bus_results_details' class='suggest_box'></div>");

						console.log(dirRequests);
						if (dirRequests.length > 0) {
							showonmap(0);
						}
						$('[id*=row_]:first').addClass('active_tr');
					});

			request.fail(function(jqXHR, textStatus) {
				alert("Request failed: " + textStatus);
			});
		}

		else {
			$('#results').html();
			$('#results').show();
			$('#bus-result').hide();
			var dirRequest = {
				origin : start + " , sri lanka",
				destination : end + " , sri lanka",
				travelMode : selectedMode,
				provideRouteAlternatives : true
			};

			directionsService.route(dirRequest, showDirections);

		}
	}
}

// Find Near Locations
var markers = Array();
var infos = Array();
var draw_circle = null;
var center;
var currentLatitude;
var currentLongitude;

// to clear pins which is already exists if any
function clearOverlays() {
	if (markers) {
		for (i in markers) {
			markers[i].setMap(null);
		}
		markers = [];
		infos = [];
	}
}

// clear infos function
function clearInfos() {
	if (infos) {
		for (i in infos) {
			if (infos[i].getMap()) {
				infos[i].close();
			}
		}
	}
}

// Track the current position on GPS and pin the nearest locations
function findPlaces() {

	getLocation();

	mapCenter = new google.maps.LatLng(currentLatitude, currentLongitude);

	// prepare variables (filter)
	type = document.getElementById('gmap_type').value;
	var radius = document.getElementById('gmap_radius').value;

	var cur_location = new google.maps.LatLng(currentLatitude, currentLongitude);

	var pinIcon = new google.maps.MarkerImage("./images/centerPin.png", null, /*
	 */
	null, /* origin is 0,0 */
	null, /* anchor is bottom center of the scaled image */
	new google.maps.Size(38, 38));

	var myPlaceMarker = new google.maps.Marker({
		position : latlng,
		map : map,
		icon : pinIcon
	});

	// prepare request to Places
	var request = {
		location : cur_location,
		radius : radius,
		types : [ type ]
	};
	// calling for draw a circle

	DrawCircle(radius, mapCenter);

	// send request
	service = new google.maps.places.PlacesService(map);
	service.search(request, createMarkers);
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		alert("some error occurs tracking your location");
	}
}

function showPosition(position) {
	currentLatitude = position.coords.latitude;
	currentLongitude = position.coords.longitude;
	latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
}

// Draw the radar circle
function DrawCircle(rad, latlng) {

	rad *= 1; // convert to meters if in miles
	if (draw_circle != null) {
		draw_circle.setMap(null);
	}
	draw_circle = new google.maps.Circle({
		center : latlng,
		radius : rad,
		strokeColor : "#148BE5",
		strokeOpacity : 0.8,
		strokeWeight : 2,
		fillColor : "#148BE5",
		fillOpacity : 0.25,
		map : map
	});
}

// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
	pinIcons = new google.maps.MarkerImage(icons[type].icon,
			new google.maps.Size(20, 32), new google.maps.Point(0, 0),
			new google.maps.Point(0, 32));

	if (status == google.maps.places.PlacesServiceStatus.OK) {

		// if we have found something - clear map (overlays)
		clearOverlays();

		// and create new markers by search result
		for ( var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
	} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
		alert('Sorry, nothing is found');
	}
}

// creare single marker function
function createMarker(obj) {

	// prepare new Marker object
	var mark = new google.maps.Marker({
		position : obj.geometry.location,
		map : map,
		icon : icons[type].icon,
		title : obj.name
	});
	markers.push(mark);

	// prepare info window
	var infowindow = new google.maps.InfoWindow({
		content : '<img src="' + obj.icon + '" /><font style="color:#000;">'
				+ obj.name + '<br />Rating: ' + obj.rating + '<br />Vicinity: '
				+ obj.vicinity + '</font>'
	});

	// add event handler to current marker
	google.maps.event.addListener(mark, 'click', function() {
		clearInfos();
		infowindow.open(map, mark);
	});
	infos.push(infowindow);
}

function fadingMsg(locMsg) {
	$(
			"<div class='ui-overlay-shadow ui-body-e ui-corner-all fading-msg'>"
					+ locMsg + "</div>").css({
		"display" : "block",
		"opacity" : 0.9,
		"top" : $(window).scrollTop() + 100
	}).appendTo($.mobile.pageContainer).delay(2200).fadeOut(1000, function() {
		$(this).remove();
	});
}

// Go to map page to see instruction detail (zoom) on map page
$('#directions').live("tap", function() {
	$.mobile.changePage($('#map_page'), {});
});

$('#routecost').live("tap", function() {
	$.mobile.changePage($('#map_page'), {});
});

/*
 * $('#routeNo').live("click", function() { $('#route_details').show(); });
 */

$('#page-dir').live("pageshow", function() {
	fadingMsg("Tap any instruction<br/>to see details on map");
});

var prevSelection = "tab1";
$("#myTab ul li").live("click", function() {
	var newSelection = $(this).children("a").attr("data-tab-class");
	$("." + prevSelection).addClass("ui-screen-hidden");
	$("." + newSelection).removeClass("ui-screen-hidden");
	prevSelection = newSelection;
});


