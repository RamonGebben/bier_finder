var googleApiKey = "&key=AIzaSyBGlSH0Z44rw4fniavK7IXXIAoSRYYu5G4";
var googleApiUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var request = require('request');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function( req, res ) {
	res.send(200);
});

app.get('/convert/:zipcode', function( req, res ){
	request( googleApiUrl + req.params.zipcode + '%20Netherlands' + googleApiKey, function( error, response, body ){
		if( !error && response.statusCode === 200 ){
			var gResp = JSON.parse( body );
			if( gResp.results && gResp.results.length !== 0 ){
				res.json( gResp.results[0].geometry.location );
			}else {
				res.json( {"error": "could not convert, sorry."} );
			}
		}else {
			res.json( {"error": "Troubles reaching Google..", "request_info": error } );
		}
	});
});

app.get('/breweries', function( req, res ){
	request('http://downloads.oberon.nl/opdracht/brouwerijen.php', function( error, response, body ){
		if( !error && response.statusCode === 200 ){
			res.json( JSON.parse( body ).breweries );
		}else {
			res.send(500);
		}
	});
});

app.listen(6789);