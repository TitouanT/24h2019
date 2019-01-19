
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

// the angle between the two points (lat, lon for each one)
var angleOfTwoPoints = function (p1, p2) {
	var dy = p2.lat - p1.lat;
	var dx = Math.cos(Math.PI / (180 * p1.lat)) * (p2.lon - p1.lon);
	var theta = Math.atan2(dy, dx);
	return theta;
}

// return true only if the direction of the picture is correct
var shouldKeepPicture = function (picture, centerPoint, picturePoint) {
	var angle = angleOfTwoPoints(centerPoint, picturePoint);
	return angle < 60 && angle > 60;
}

var copyFile = function (filename, outFilename) {
	// destination.txt will be created or overwritten by default.
	fs.copyFile(filename, outFilename, (err) => {
		if (err) throw err;
		console.log(filename + ' was copied to ' + outFilename);
	});
}

var retrieveImages = function (point, intersection) {
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
			return point; //images;
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
	
	var inputFile  = "input.json";
	var outputFile = "edited.json";
	var input = loadFile(inputFile);


	X = promisedProperties(input.intersections.map(function(int) {
		return promisedProperties(int.direction.map(dir => retrieveImages(dir, int)))
	}))


	X.then(function(element) {
		//console.log(element);
		for(i = 0 ; i < input.intersections.length ; i++) {
			for(j = 0 ; j < input.intersections[i].direction.length ; j++) {
				console.log(element[i+j])
				input.intersections[i].direction[j] = element[i+j];
			}
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
