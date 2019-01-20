var fs = require('fs');
var request = require('request');
var sha256 = require('js-sha256').sha256;
var download = require('image-downloader')


const directory = "img/"

var downloadImage = function (uri, filename, callback) {
	const options = {
		  url: uri,
		  dest: filename 
	}
	download.image(options)
		.then(({ filename, image }) => {
			callback();
		})
		.catch((err) => {
			console.error(err)
		})
};

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

var main = function() {

	const inputFile  = "edited.json";
	const outputFile = "output.json";
	var file = loadFile(inputFile);

	console.log(file.intersections[0]);
	for(var i = 0 ; i < file.intersections.length ; i++) {
		
		if(file.intersections[i]["images"] != undefined) {
			for(var j = 0 ; j < file.intersections[i].images.length ; j++) {
				var filename = sha256(file.intersections[i].images[j]); 
				downloadImage(file.intersections[i].images[j], directory + filename + '.jpg', function() {

				});
				file.intersections[i].images[j] = filename + '.jpg';
			}
		}
		else {
			console.log(i);
		}
	}

	saveFile(outputFile, file);

}

main();
