[out:json];
way
  [highway~"residential|motorway|motorway_link|trunk|trunk_link+|services|rest_area|primary|secondary|tertiary|unclassified",i]
({{bbox}});
(._;>;);
out;

/*
wget "http://overpass-api.de/api/interpreter?data=node[name=\"Gielgen\"];out;"
wget "http://overpass-api.de/api/interpreter?data=[out:json];way(30053737);(._;>;);out;"
*/

[out:json];
way(30053737);
(._;>;);
out;

