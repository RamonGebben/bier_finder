
d3.selection.prototype.hide = function() {
  this.style('display', 'none');
  return this;
};

String.prototype.capitalize = function(){
	return this.substr( 0, 1 ).toUpperCase() + this.substr(1);
};

String.prototype.titleize = function(){
	return this.split(/\W+/g).map(function( s ){ return s.capitalize(); }).join(' ');
};

String.prototype.googlify = function(){
	// https://www.google.com/maps/dir/760+West+Genesee+Street+Syracuse+NY+13204/314+Avery+Avenue+Syracuse+NY+13204
	return this.split(/\W+/g).join('+');
}

var app = {
	breweries: [],
	user: {},
	closest: {}
};

app.initialize = function(){
	getBreweries().then(function( data ){
		data.forEach( function( brewery, i ){
			app.convert( brewery.address, function( location ){
				brewery.location = location;
				app.breweries.push( brewery );
			});
		});
	});

	d3.select('.beer_me').on('click', run )
	var input = document.getElementsByClassName('zipcode_field')[0];
	input.addEventListener('keydown', function( e ){
		if( e.keyCode === 13 ){
			run();
		}
	});
	input.addEventListener('focus', function( e ){
		d3.select('.input_wraper').classed('focus', true );
	});
	console.log('Ready to go!')
};

app.get = function( url, callback ){
	d3.xhr( url )
		.header("Content-Type", "application/json")
		.get().on('load', function( data ){
			var resp = JSON.parse( data.response );
			if( callback ) callback( resp );
		}).on('error', function( err ){
			if( callback ) callback( err );
		});
};

app.convert = function( pos, callback ){
	var location = this.get('/convert/' + pos, function( reply ){
		if( callback ) callback( reply );
	});
};

app.format = function( e ){
	switch( typeof( e ) ){
		case 'number':
			return Math.floor( e );
		case 'string':
			return e.titleize();
	};
};

var run = function(){
	d3.select('.zip_window').classed('invalid', false );
	d3.select('.zip_window').classed('loading', true );
	app.convert( d3.select('.zipcode_field').property("value"), function( pos ){
		if( pos.error ){
			d3.select('.zip_window').classed('invalid', true );
		}else {
			app.user.location = pos;
			findBrewery( pos, function( brewery ){
				showOnMap( brewery );
			});
		}
	});
}

var getBreweries = function( callback ){
	var deferred = Q.defer();
	app.get('/breweries', deferred.resolve );
	return deferred.promise;
};

var findBrewery = function( location, callback ){
	var the_one = {};
	app.breweries.forEach(function( brewery, i ){
		if( !brewery.dist ){
			var dist = mapper.getDistance( location, brewery.location );
			brewery.dist = dist;
		}

		if( brewery.dist <= the_one.dist || the_one.dist === undefined ){
			the_one = brewery;
			app.closest = brewery;
		}
	});
	if( callback ) callback( the_one );
};

var showOnMap = function( brewery ){
	mapper.calcRoute( app.user, brewery );
	d3.select('.fake_map').classed('hidden', true );
	d3.select('.zip_window').classed('hidden', true );
	setTimeout(function(){
		d3.select('.fake_map').hide();
		d3.select('.zip_window').hide();
		showBrewery( brewery );
	}, 800);
};

// TODO: fix html escaping van innerHTML assignments
var showBrewery = function( brewery ){
	d3.select('#bd_title').text( brewery.name );
	document.getElementById('bd_info').innerHTML = '';
	for( var key in brewery ){
		if( key !== 'location' && key !== 'name' ){
			if( key === 'open' ){
				var open = document.createElement('ul');
				open.className = 'open';
				var open_header = document.createElement('h3');
				open_header.className = "open_header";
				open_header.innerHTML = "Geopend op:";

				document.getElementById('bd_info').appendChild( open_header );
				document.getElementById('bd_info').appendChild( open );
				for (var i = 0; i < brewery.open.length; i++) {
					var day = document.createElement('li');
					day.className = brewery.open[i];
					day.innerHTML = brewery.open[i];
					open.appendChild( day );
				};
			}else {
				var elem = document.createElement('div');
				elem.className = key;
				if( key !== 'dist'){
					elem.innerHTML = app.format( key ) + ': ' + app.format( brewery[ key ] );
				}else {
					elem.innerHTML =  "Afstand: " + app.format( brewery[ key ] )+ ' meter';
				}
				document.getElementById('bd_info').appendChild( elem );
			}
		}
	}
	var maps_link = document.createElement('a');
	maps_link.href = "https://maps.google.com?saddr=Current+Location&daddr=" + brewery.address.googlify();
	maps_link.innerHTML = "Open in maps";
	maps_link.setAttribute('target', '_blank')
	maps_link.className = 'maps_link'
	document.getElementById('bd_info').appendChild( maps_link );
	d3.select('#close_brewery').on('click', function(){
		d3.select('.brewery_window').classed('hidden', true );
	});
	d3.select('.brewery_window').classed('hidden', false );
};

app.initialize();