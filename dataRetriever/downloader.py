import json
import hashlib
import requests
import os.path


def downloadImage(url, filename):
    if not os.path.exists('img/' + filename):
        with open('img/' + filename, 'wb') as f:
            f.write(requests.get(url).content)

def main():

    input = json.loads(open('edited.json').read())

    print(input)

    for inter in input['intersections']:
        for direction in inter['direction']:
            for image in direction['images']:
                image['id'] = hashlib.sha256(image['pathExt'].encode('utf-8')).hexdigest()
                image['pathInt'] = 'img/' + image['id'] + '.jpg'
                downloadImage(image['pathExt'], image['id'] + '.jpg')

    with open('output2.json', 'w') as outfile:
        json.dump(input, outfile)


if __name__ == "__main__":
    main()
