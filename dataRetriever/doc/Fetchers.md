Fetchers
========

A _Fetcher_ is a picture provider, which offers geolocated, open-licensed pictures. They are defined using the _Fetcher_ class (see [API documentation](API.md)). Here is a list of available providers in Pic4Carto.js. If you want to see another provider integrated, please open an [Issue](https://framagit.org/Pic4Carto/Pic4Carto.js/issues) (it must provide open-licensed pictures for free via a web API).

Flickr
------

* Website: https://www.flickr.com/
* API documentation: https://www.flickr.com/services/api/
* Pictures license: Creative Commons, other open licenses


Mapillary
---------

* Website: https://www.mapillary.com/
* API documentation: https://a.mapillary.com/
* Pictures license: Creative Commons By-SA


OpenStreetCam
-------------

* Website: http://openstreetcam.org/
* API documentation: none
* Pictures license: Creative Commons By-SA


Wikimedia Commons
-----------------

* Website: https://commons.wikimedia.org/
* API documentation: https://www.mediawiki.org/wiki/API:Main_page
* Pictures license: various open licenses


CSV (User-defined)
------------------

If you want to make available statically served pictures, you can use the _CSV_ Fetcher. It reads pictures metadata from a CSV file you have to define.

### Definition

The CSV file must be in UTF-8 and semicolon-separated. Columns are the following:
* Mandatory
 * `picture_url`: the URL of the picture (must be publicly available)
 * `latitude`: the picture latitude, in degrees (WGS84)
 * `longitude`: the picture longitude, in degrees (WGS84)
 * `timestamp`: the picture taken date, in UNIX timestamp (seconds)
* Optional
 * `user`: the author of the picture
 * `license`: the license of the picture
 * `details_url`: the URL where more details about the picture can be found
 * `direction`: the picture direction, in degrees (between 0 and 360, 0 being North)


### Example

```
picture_url;latitude;longitude;timestamp;user;license;details_url;direction
http://localhost:3000/images/001.jpg;0.001;0.001;1234;;CC By-Sa 2.0;http://localhost:3000/details/001;152
http://localhost:3000/images/002.jpg;0.002;0.002;1235;User #2;;http://localhost:3000/details/002;256
http://localhost:3000/images/003.jpg;-0.001;-0.001;1236;User #3;CC0;;42
http://localhost:3000/images/004.jpg;0.004;0.004;1237;User #4;CC0;http://localhost:3000/details/004;
```
