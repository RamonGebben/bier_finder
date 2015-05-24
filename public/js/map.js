


var mapper = {
	directionsService: new google.maps.DirectionsService(),
	directionsDisplay: new google.maps.DirectionsRenderer({suppressMarkers: true}),
};

mapper.initialize = function() {
	var mapCanvas = document.getElementById('map_canvas');
	mapCanvas.style.height = window.innerHeight.toString() + 'px';
	mapCanvas.style.width = window.innerWidth.toString() + 'px';

	window.onresize = function( e ){
		mapCanvas.style.height = window.innerHeight.toString() + 'px';
		mapCanvas.style.width = window.innerWidth.toString() + 'px';
	};

	var styles = [
		{
			stylers: [
				{ hue: "#02AFEF" },
				{ saturation: 0 }
			]
		},{
			featureType: "road",
			elementType: "geometry",
			stylers: [
				{ lightness: 0 },
				{ visibility: "simplified" }
			]
		},{
			featureType: "road",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		}
	];

	var mapOptions = {
		center: {lat: 52.1158381, lng: 5.117370999999999 },
		zoom: 8,
		styles: styles,
		disableDefaultUI: true
	};

	mapper.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	mapper.directionsDisplay.setMap( mapper.map );
};

mapper.setMarker = function( obj ){
	var googleLocation = new google.maps.LatLng( obj.location.lat, obj.location.lng );
	var options = {
		map: mapper.map,
		title: obj.name || "Jou locatie",
		position: googleLocation,
		icon: '/img/you_marker.png'
	};

	if( obj.name ) options.icon = '/img/beer_marker.png';

	var marker = new google.maps.Marker( options );
	if( obj.name ){
		google.maps.event.addListener(marker, 'mousedown', function(){
			showBrewery( obj );
		});
	}
};

mapper.getGeoLocation = function(){
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition( function( pos ){
    		app.user.location = {};
    		app.user.location.lat = pos.coords.latitude;
    		app.user.location.lng = pos.coords.longitude;
    	});
    }
};

// http://www.wikiwand.com/en/Haversine_formula
mapper.radius = function( x ){
  return x * Math.PI / 180;
};

mapper.getDistance = function(p1, p2) {
	var R = 6378137;
	var dLat = mapper.radius( p2.lat - p1.lat );
	var dLong = mapper.radius( p2.lng - p1.lng );
  	var a = Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) + Math.cos( mapper.radius( p1.lat ) ) * Math.cos( mapper.radius( p2.lat ) ) * Math.sin( dLong / 2 ) * Math.sin( dLong / 2 );
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  	var d = R * c;
  	return d;
};

mapper.panToLocation = function( lat, lng ){
	var googleLocation = new google.maps.LatLng( lat, lng );
	mapper.map.panTo( googleLocation );
	mapper.map.setZoom(12);
};

mapper.calcRoute = function( user, brewery ) {
  var start = new google.maps.LatLng( user.location.lat, user.location.lng );
  var dest = new google.maps.LatLng( brewery.location.lat, brewery.location.lng );

  var request = {
    origin: start,
    destination: dest,
    travelMode: google.maps.TravelMode.WALKING
  };

  mapper.directionsService.route(request, function( result, status ){
    if( status == google.maps.DirectionsStatus.OK ) {
      mapper.directionsDisplay.setDirections( result );
      mapper.setMarker( user );
      mapper.setMarker( brewery );
    }
  });
}


google.maps.event.addDomListener(window, 'load', mapper.initialize );


