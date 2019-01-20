#!/bin/python3
import json
import math
from pprint import pprint

with open("./raw_overpass_data.json") as f:
    data = json.load(f)["elements"]


nodes = [elt for elt in data if elt['type'] == 'node']
ways = [elt for elt in data if elt['type'] == 'way']
nodes_by_id = {}
stops = []

# rangement des nodes
for node in nodes:
    nodes_by_id[node["id"]] = node

    if "tags" in node:
        tags = node["tags"]
        if "highway" in tags:
            cat = tags["highway"]
            if cat == "stop":
                stops.append(node)

# construction de l'objet de retour
intersections = []
# pprint(ways)
def forward(node):

    matching_ways = [w for w in ways if node["id"] in w["nodes"]]
    if not len(matching_ways) == 1:
        # print("Attention")
        return None
    way = matching_ways[0]

    index = way["nodes"].index(node["id"])

    nodes_before = list(reversed(way["nodes"]))[index+1:]
    if (len(nodes_before) == 0):
        return None

    match = firstafter10(node, nodes_before)

    obj = {}
    center = {}
    direction = {}
    obj["center"] = center
    obj["direction"] = direction
    obj["stop"] = "none"

    center["lon"] = node["lon"]
    center["lat"] = node["lat"]
    direction["lon"] = match["lon"]
    direction["lat"] = match["lat"]

    return obj

def firstafter10(node, nodes):
    # lona, lata = noda["lon"], noda["lat"]
    lonb, latb = node["lon"], node["lat"]

    nodes = [nodes_by_id[i] for i in nodes]

    dist_after = [distlonlat(noda["lon"], noda["lat"], lonb, latb) / 1000 for noda in nodes]

    index = 0
    for i, d in enumerate(dist_after):
        if d >= 10:
            return nodes[i]
        index = i

    return nodes[index]


def backward(node):

    matching_ways = [w for w in ways if node["id"] in w["nodes"]]
    if not len(matching_ways) == 1:
        # print("Attention", len(matching_ways))
        return None
    way = matching_ways[0]

    index = way["nodes"].index(node["id"])

    nodes_after = way["nodes"][index+1:]
    if (len(nodes_after) == 0):
        return None

    match = firstafter10(node, nodes_after)


    obj = {}
    center = {}
    direction = {}
    obj["center"] = center
    obj["direction"] = direction
    obj["stop"] = "none"

    center["lon"] = node["lon"]
    center["lat"] = node["lat"]
    direction["lon"] = match["lon"]
    direction["lat"] = match["lat"]


    return obj

def distlonlat(lona, lata, lonb, latb):
    dlon = lona - lonb
    dlat = lata - latb
    a = math.sin(dlat / 2)**2 + math.cos(lata) * math.cos(latb) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = 6373.0 * c
    return distance

for stop in stops:
    fwd = forward(stop)
    if fwd:
        if "direction" in stop["tags"]:
            if stop["tags"]["direction"] == "forward":
                fwd["stop"] = "yes"
            else:
                fwd["stop"] = "no"
        intersections.append(fwd)

    bwd = backward(stop)
    if bwd:
        if "direction" in stop["tags"]:
            if stop["tags"]["direction"] == "backward":
                bwd["stop"] = "yes"
            else:
                bwd["stop"] = "no"
        intersections.append(bwd)

processed = {}
processed["intersections"] = intersections

jsondata = json.dumps(processed, indent=4)
# jsondata = json.dumps(processed)
print(jsondata)
