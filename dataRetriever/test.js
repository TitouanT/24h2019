
var P4C = require("pic4carto");

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.XMLHttpRequest.DONE = 4;


var picManager = new P4C.PicturesManager();

picManager.startPicsRetrievalAround(new P4C.LatLng(48.0159348, 0.2034504), 15, { mindate: 0, towardscenter: true })
	.then(function(pictures) {
		for(var i=0; i < pictures.length; i++) {
			var pic = pictures[i];
				console.log(pic.pictureUrl);	
			}
			
});
