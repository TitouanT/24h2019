var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var P4C = require("pic4carto");



var picManager = new P4C.PicturesManager();

//Call for pictures download
picManager.startPicsRetrieval(new P4C.LatLngBounds(new P4C.LatLng(48.1075, -1.6860), new P4C.LatLng(48.1156, -1.6739)))
.then(function(pictures) { //Called when promise resolves
	for(let pId=0; pId < pictures.length; pId++) {
		let currentPicture = pictures[pId];
		console.log(currentPicture.pictureUrl);
	}
});
