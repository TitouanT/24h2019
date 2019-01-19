
var P4C = require("pic4carto");
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

class Position {
	
	constructor(lat, lon) {
		this.lat = lat;
		this.lon = lon;
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

	var inputFile  = "input.json";
	var outputFile = "edited.json";
	var input = loadFile(inputFile);


	/*X = promisedProperties(input.intersections.map(function(int) {
		return retrieveImages(int))
	})
*/

	X.then(function(element) {
		//console.log(element);
		for(i = 0 ; i < input.intersections.length ; i++) {
			input.intersections[i] = element[i];
		}
		//console.log(JSON.stringify(element));
		console.log(input);
	});
	

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
