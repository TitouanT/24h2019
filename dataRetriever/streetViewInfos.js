
var P4C  = require("pic4carto");
var jsts = require("jsts");
var fs   = require('fs');
var request = require('request');

var directory = 'img/'

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.XMLHttpRequest.DONE = 4;

var picManager = new P4C.PicturesManager();

var loadFile = function (filename) {
	var contents = fs.readFileSync(filename);
	return JSON.parse(contents);
}

var saveFile = function (filename, object) {
	var contents = JSON.stringify(object, null, 2);
	fs.writeFile(filename, contents, function(err) {
		if(err)
			console.log(err);
	});
}

var compter = 0;

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

	getPicturesURL(orientationPoint) {
		const maxAngle = 120;
		const radius = 15;
		const P4CPoint = new P4C.LatLng(this.lat, this.lon);
		const me = this;

		return picManager
			.startPicsRetrievalAround(P4CPoint, radius, {mindate: 0, towardscenter: true})
			.then(function(pictures) {
				var urls = [];
				for(var i = 0 ; i < pictures.length ; i++) {
					var url = pictures[i].thumbUrl;
					if(url == null)
						url = pictures[i].pictureUrl;

					const actual  = pictures[i].direction;
					const toPoint = Position.angleOfTwoPoints(me, orientationPoint);
					const delta   = Math.abs(actual - toPoint);
			
					if(delta < maxAngle) {
						//console.log(url);
						urls.push(url);
					}
					
				}
				console.log(compter);
				compter += 1;
				return urls;
			});
	}

	orientationToPoint(point) {
		return Position.angleOfTwoPoints(this, point);
	}

	static angleOfTwoPoints(p1, p2) {
		var r = (Math.atan2(p2.lon - p1.lon, p2.lat - p1.lat) * 180 / Math.PI) - 90;
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


var main = function() {
	var inputFile  = "input.json";
	var outputFile = "edited.json";
	var input = loadFile(inputFile);
	var promises = [];
	
	const max = 800;//input.intersections.length;


	for(var i = 0 ; i < max ; i++) {
		var intersection = input.intersections[i];
		var p1 = Position.fromJSON(intersection["center"]);
		var p2 = Position.fromJSON(intersection["direction"]);
		try {
			urls = p2.getPicturesURL(p1);
			console.log(i + " / " + max);
			promises.push(urls);
		}
		catch(err) {

		}
	}

	Promise.all(promises).then(function(data) {
		for(var i = 0 ; i < data.length ; i++) {
			input["intersections"][i]["images"] = data[i];
		}
		saveFile(outputFile, input);
	});

}

main();
