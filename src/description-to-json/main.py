import openai
import json
from treehouse.security import SecretManager

GOOGLE_PROJECT_ID = "techday-team-c"

PROMPT = """
Respond with this JSON structure and if there are no results give 'na' as a return for strings:
    {
    "Plaats": str,
    "Straat": str,
    "Huisnummer": str,
    "Postcode": str,
    "Huurprijs (zonder euro sign)": int,
    "Aangeboden sinds wanneer? (annotatie in D-M-2023)": str,
    "Is de woning verhuurd of te huur?": str,
    "Per waneer beschikbaar? (annotatie in D-M-2023)": str,
    "Huurovereenkomst:": str,
    "Looptijd (onbepaalde tijd of tijdelijke verhuur):": str,
    "Interieur (gemeubileerd, kaal, gestoffeerd):": str,
    "Woonoppervlakte (in m2):": str,
    "Type woning (appartement, huis):": str,
    "Soort bouw (bestaande bouw of nieuwbouw)": str,
    "Aantal kamers": int,
    "Aantal slaapkamers": int,
    "Aantal badkamers": int,
    "Balkon aanwezig? ja/nee": str,
    "Tuin aanwezig? ja/nee": str,
    "Douche aanwezig? ja/nee": str,
    "Toilet aanwezig? ja/nee": str,
    "Energielabel": str,
    "Bergruimte aanwezig? ja/nee": str,
    "Schuur/Berging aanwezig? ja/nee": str,
    "Parkeergelegenheid aanwezig? ja/nee": str,
    "Garage aanwezig? ja/nee": str  
    }

Extract all the information needed for the response from the following text:    
"""


def get_features_from_description(prompt: str) -> dict:
    # Get API key from Secret Manager
    sm = SecretManager(GOOGLE_PROJECT_ID)
    gpt_api_key = sm.get("gpt-api-key")
    openai.api_key = gpt_api_key

    # Call openai to get stuff from description
    completion = openai.Completion.create(model="text-davinci-003", prompt=prompt)

    # print the completion
    print(completion.choices[0].text)

    result = json.loads(completion.choices[0].text)

    return result


def handler(request):
    request_json = request.get_json(silent=True) or {}

    if "description" not in request_json:
        return "No description in request", 400

    prompt = PROMPT
    if "prompt" not in request_json:
        print("No prompt provided, using default")
    else:
        prompt = request_json["prompt"]

    print(f'Starting with description: {request_json["description"][0:150]}')

    listing_data = get_features_from_description(
        prompt=prompt + request_json["description"]
    )

    print("Result:")
    print(listing_data)

    return json.dumps(listing_data), 200
