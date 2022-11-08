import requests
import json
# the requests are copied verbatium from the uberduck api referance 

def getVoices():            #never really acsessed by the bot

    url = "https://api.uberduck.ai/voices?mode=tts-all&language=english"

    headers = {
        "accept": "application/json",
        "authorization": "Basic cHViX2N3ZnVjaGlya3JndXZwYWZwazpwa181NjI2ZDUyMi1jYjJmLTQwMWMtOTc4Yy1lZDRmNzJlNmYyY2Q="
    }

    response = requests.get(url, headers=headers)

    unparsed = json.loads(response.text) 
    # stringfy = json.dumps(unparsed)

    parsed_voices = []

    for i in unparsed:

        new_voice = {
            "category": i['category'],
            "name": i['display_name'],
            "uuid": i['voicemodel_uuid']
        }

        parsed_voices.append(new_voice)

    stringfy = json.dumps(parsed_voices)

    with open('uberduckVoices.json', 'w+') as f:
        f.write(stringfy)

def generateSpeech(voice_uuid=None, text=None):

    if voice_uuid==None: voice_uuid = "af6e7f9f-4d46-4952-b024-81c34a20fc59"
    if text==None: text = 'hello world'

    url = "https://api.uberduck.ai/speak"

    payload = {
        "voice": "lj",
        "pace": 1,
        "speech": text,
        "voicemodel_uuid": voice_uuid
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": "Basic cHViX2N3ZnVjaGlya3JndXZwYWZwazpwa181NjI2ZDUyMi1jYjJmLTQwMWMtOTc4Yy1lZDRmNzJlNmYyY2Q="
    }

    response = requests.post(url, json=payload, headers=headers)

    # print('hello world')
    x = json.loads(response.text)['uuid']
    print(str(x))

def checkStatus(req_id=None):
    if req_id==None: print(False); return 

    url = f"https://api.uberduck.ai/speak-status?uuid={req_id}"
    headers = {"accept": "application/json"}

    response = requests.get(url, headers=headers)
    x = json.loads(response.text)['path']
    print(x)


# getVoices()
# uuid = generateSpeech()
# print(uuid)
# url = checkStatus("eeb7610e-67e3-4c85-8c86-592eac98b8f0")
# print(url)

# getVoices()