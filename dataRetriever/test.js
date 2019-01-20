
var P4C = require("pic4carto");
var jsts = require("jsts");
var fs = require('fs');
var request = require('request');
var directory = 'img/'
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.XMLHttpRequest.DONE = 4;

var picManager = new P4C.PicturesManager();

/*
filename : file to load (JSON)
*/
var loadFile = function (filename) {
	var contents = fs.readFileSync(filename);
	// Define to JSON type
	return JSON.parse(contents);
}

var saveFile = function (filename, object) {
	var contents = JSON.stringify(object);
	fs.writeFile(filename, contents, function(err) {
		if(err)
			console.log(err);
	});
}


// return true only if the direction of the picture is correct
var shouldKeepPicture = function (picture, centerPoint, picturePoint) {
	var angle = angleOfTwoPoints(centerPoint, picturePoint);
	return angle < 60 && angle > 60;
}

const mapCoordsArray = (arr, fct) => {
	if(arr.length === 2 && typeof arr[0] === "number" && typeof arr[1] === "number") {
		return fct(arr[0], arr[1]);
	}
	else {
		return arr.map(a => mapCoordsArray(a, fct));
	}
};

const cvt4326to3857 = (lon,lat) => {
	const x = lon * 20037508.34 / 180;
	let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
	y = y * 20037508.34 / 180;
	return [x, y];
};

const cvt3857to4326 = (x, y) => {
	const lon = x *  180 / 20037508.34;
	const lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90;
	return [lon, lat];
};

const geomFactory = new jsts.geom.GeometryFactory();

var debug = function (p) {
	console.log(p.lat.toFixed(6) + "\t" + p.lon.toFixed(6) + "\tcross5\tred\t1");
}
class Position {
	
	constructor(lat, lon) {
		this.lat = lat;
		this.lon = lon;
	}

	static fromJSON(json) {
		return new Position(json.lat, json.lon)
	}

	debug() {
		console.log(this.lat.toFixed(6) + "\t" + this.lon.toFixed(6) + "\tcross5\tred\t1");
	}

	movePoint(northMeters, eastMeters) {
		//Earth’s radius, sphere
		const R = 6378137;

		//Coordinate offsets in radians
		const dLat = northMeters / R;
		const dLon = eastMeters / (R * Math.cos(Math.PI * this.lat / 180));

		this.lat += dLat * 180 / Math.PI;
		this.lon += dLon * 180 / Math.PI;

		return this;
	}

	movePointTowardNorth(meters) {
		return this.movePoint(meters, 0.0);
		//this.lat += meters / 111111;
		//return this;
	}

	movePointTowardEast(meters) {
		return this.movePoint(0.0, meters);
		//this.lon += meters / (111111 * Math.cos(this.lat));
		//return this;
	}

	static angleOfTwoPoints(p1, p2) {
		var r = Math.abs((Math.atan2(p2.lon - p1.lon, p2.lat - p1.lat) * 180 / Math.PI) - 90);
		if(r == 180) {
			return 0;
		}
		else return r;
	}

	static getBoundsAroundLine(p1, p2) {

		var theta = Position.angleOfTwoPoints(p1, p2);
		var alpha = 90 - theta;
		var distance = 10; // 5 meters => 10m wide rectangle
		var y = distance * Math.sin(alpha * (180 / Math.PI));
		var x = distance * Math.cos(alpha * (180 / Math.PI));
		var bound1 = p1.movePoint(y,  x);
		var bound2 = p2.movePoint(-y,-x);
	
		return [bound1, bound2];
	}

	static toGeoJSON(points) {
		var json = {
			"type": "Feature",
			"geometry": {
				"type": "MultiPoint",
				"coordinates": []
			},
			"properties": {
				"id": "patate-sucree"	  
			}
		};
		for(var i = 0 ; i < points.length ; i++) {
			json["geometry"]["coordinates"].push([points[i].lon, points[i].lat]);
		}
		return json;
	}




	static getBufferAroundPoints(points) {

		let json = Position.toGeoJSON(points);
		let geom = json.geometry;

		let g = (new jsts.io.GeoJSONReader()).read({
			type: geom.type, 
			coordinates: mapCoordsArray(geom.coordinates, cvt4326to3857)
		});

		
		g = g.buffer(40);
		const res = (new jsts.io.GeoJSONWriter()).write(g);
		res.coordinates = mapCoordsArray(res.coordinates, cvt3857to4326);

		var buffer = (new jsts.io.GeoJSONReader()).read(geom); // normalement g!!!!!!!!!!!!

		return buffer;

	}


	static getImages(points) {

		const buffer = Position.getBufferAroundPoints(points); 
		const envl   = buffer.getEnvelopeInternal();

		console.log("=====")
		debug({"lat": envl.getMinY(), "lon": envl.getMinX()});
		debug({"lat": envl.getMaxY(), "lon": envl.getMaxX()});

		var images = picManager
			.startPicsRetrieval(
				new P4C.LatLngBounds(
					new P4C.LatLng(envl.getMinY(), envl.getMinX()), 
					new P4C.LatLng(envl.getMaxY(), envl.getMaxX())
				), {mindate: 0})
			.then(pics => {
				//Only send pics in buffer around feature geometry
				return pics.filter(p => {
					if(p.pictureUrl == "https://d1cuyjsrcm0gby.cloudfront.net/jvOJribQEz85GeyPKLbzpw/thumb-2048.jpg") {
						console.log(p);
						console.log(points);
						console.log(envl.getMinY(), envl.getMinX());
						console.log(envl.getMaxY(), envl.getMaxX());
					}
					//console.log(p.pictureUrl);
					var insideBuffer = buffer.contains(
						geomFactory.createPoint(
							new jsts.geom.Coordinate(
								p.coordinates.lng,
								p.coordinates.lat
							)
						)
					);
					if(insideBuffer) {
						console.log(p.pictureUrl);
					}
					else {
						//console.log("image not inside ...")
					}
				});
			})
			.catch(console.log);

	}



}


var copyFile = function (filename, outFilename) {
	// destination.txt will be created or overwritten by default.
	fs.copyFile(filename, outFilename, (err) => {
		if (err) throw err;
		console.log(filename + ' was copied to ' + outFilename);
	});
}

var retrieveImages = function (intersection) {
	return picManager.startPicsRetrievalAround(new P4C.LatLng(point.lat, point.lon), 50, {mindate: 0, towardscenter: true})
		.then(function (pictures) {
			images = []
			for (var k = 0 ; k < pictures.length ; k++) {
				var pic = pictures[k];
				if (true || shouldKeepPicture(pic, intersection.center, pic)) {
					//console.log(pic.coordinates);
					//console.log(pic.direction);
					//console.log(pic.pictureUrl);
					images.push({
						"pathExt": pic.pictureUrl
					});
				}
			}
			point['images'] = images;
			return point;//images;
		});
}

// function that takes an object with properties that might be promises and
// returns a promise of that object with resolved properties.
function promisedProperties(object) {
  let promisedProperties = [];
  const objectKeys = Object.keys(object);
  objectKeys.forEach((key) => promisedProperties.push(object[key]));
  return Promise.all(promisedProperties)
    .then((resolvedValues) => {
      return resolvedValues.reduce((resolvedObject, property, index) => {
        resolvedObject[objectKeys[index]] = property;
        return resolvedObject;
      }, object);
    });

}

var main = function () {

	/*
	p1 = new Position(47.999953, 0.197648);//47.992638, 0.193792);
	p2 = new Position(47.999477, 0.196664);

	//p1 = new Position(10.0, 0.0);
	//p2 = new Position(10.0, 10.0);

	//console.log(p1);
	//console.log(p2);
	//console.log("Angle: " + Position.angleOfTwoPoints(p1, p2));
	
	const n = 8;
	console.log(p1.lat.toFixed(n) + "\t" + p1.lon.toFixed(n) + "\tcross5\tred\t1");
	console.log(p2.lat.toFixed(n) + "\t" + p2.lon.toFixed(n) + "\tcross5\tred\t1");
	const a = Position.getBoundsAroundLine(p1, p2);
	const b1 = a[0];
	const b2 = a[1];
	//console.log(Position.getBoundsAroundLine(p1, p2));
	console.log(b1.lat.toFixed(n) + "\t" + b1.lon.toFixed(n) + "\tcross5\tgreen\t1");
	console.log(b2.lat.toFixed(n) + "\t" + b2.lon.toFixed(n) + "\tcross5\tgreen\t1");
	//
	// n e
	//console.log(p1.movePoint(1000000, 0.000000));
	return 0;
	*/

	var inputFile  = "input.json";
	var outputFile = "edited.json";
	var input = loadFile(inputFile);


	/*X = promisedProperties(input.intersections.map(function(int) {
		return retrieveImages(int))
	})
*/

	/*X.then(function(element) {
		//console.log(element);
		for(i = 0 ; i < input.intersections.length ; i++) {
			input.intersections[i] = element[i];
		}
		//console.log(JSON.stringify(element));
		console.log(input);
	});*/

	for(var i = 0 ; i < 100 ; i++){// input.intersections.length ; i++) {
		var intersection = input.intersections[i];
		var p1 = Position.fromJSON(intersection["center"]);
		var p2 = Position.fromJSON(intersection["direction"]);
		debug(p1);
		debug(p2);
		var bounds = Position.getBoundsAroundLine(p1, p2);
		debug(bounds[0]);
		debug(bounds[1]);
		console.log("===")
		//Position.getBufferAroundPoints([p1, p2]);
		//Position.getImages([p1, p2]);
	}
	

	/*for (var i = 0 ; i < input.intersections.length ; i++) {
		var intersection = input.intersections[i];
		console.log(intersection);


		for(var j = 0 ; j < intersection.direction.length ; j++) {
			retrieveImages(input.intersections[i].direction[j], intersection)
		}
	}*/
	//console.log(input)
	saveFile(outputFile, input);
}

main()
