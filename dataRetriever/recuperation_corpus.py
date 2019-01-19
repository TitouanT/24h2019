#!/bin/python3
import json
from pprint import pprint

with open("data.json") as f:
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
    if index == 0:
        return None
    othernode = nodes_by_id[way["nodes"][index - 1]]

    obj = {}
    center = {}
    direction = {}
    obj["center"] = center
    obj["direction"] = direction
    obj["stop"] = "none"

    center["lon"] = node["lon"]
    center["lat"] = node["lat"]
    direction["lon"] = othernode["lon"]
    direction["lat"] = othernode["lat"]

    return obj

def backward(node):

    matching_ways = [w for w in ways if node["id"] in w["nodes"]]
    if not len(matching_ways) == 1:
        # print("Attention", len(matching_ways))
        return None
    way = matching_ways[0]

    index = way["nodes"].index(node["id"])
    if index == len(way["nodes"]) -1:
        return None

    othernode = nodes_by_id[way["nodes"][index + 1]]

    obj = {}
    center = {}
    direction = {}
    obj["center"] = center
    obj["direction"] = direction
    obj["stop"] = "none"

    center["lon"] = node["lon"]
    center["lat"] = node["lat"]
    direction["lon"] = othernode["lon"]
    direction["lat"] = othernode["lat"]

    return obj

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

pprint(processed)
