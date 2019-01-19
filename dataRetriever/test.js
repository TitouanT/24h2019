
var P4C = require("pic4carto");
var fs = require('fs');
var request = require('request');
var directory = 'img/'
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.XMLHttpRequest.DONE = 4;

var picManager = new P4C.PicturesManager();
var imageCounter = 0

/*
uri : download uri
filename : output filename 
callback : what to call after
*/
var download = function (uri, filename, callback) {
	request.head(uri, function (err, res, body) {
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};

/*
filename : file to load (JSON)
*/
var loadFile = function (filename) {
	var contents = fs.readFileSync(filename);
	// Define to JSON type
	return JSON.parse(contents);
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

var retrieveImage = function (lat, long) {
	picManager.startPicsRetrievalAround(new P4C.LatLng(lat, long), 15, { mindate: 0, towardscenter: true })
		.then(function (pictures) {
			for (k = 0; k < pictures.length; k++ , imageCounter++) {
				var pic = pictures[k];
				/*download(pic.pictureUrl, directory + imageCounter + '.jpg', function () {
					console.log('Downloaded');
				});*/
				console.log(pic.coordinates);
				console.log(pic.direction);
			}
		});
}

var main = function () {
	var input = loadFile("input.json");

	copyFile("input.json", "output.json")
	for (var i = 0; i < input.intersections.length; i++) {
		for (var j = 0; j < input.intersections[i].direction.length; j++) {
			retrieveImage(input.intersections[i].direction[j].lat, input.intersections[i].direction[j].lon)
		}
	}
}

main()
