import openai
import json
from google.cloud import secretmanager
import functions_framework

GOOGLE_PROJECT_ID = "techday-team-c"

FEATURES_JSON_PROMPT = """
Respond with this JSON structure and if there are no results give null as a return for strings:
{
  "rentalPrice": {
    "label": "Huurprijs",
    "value": "12.34"
  },
  "availableSince": {
    "label": "Aangeboden sinds",
    "value": "DD-MM-YYYY"
  },
  "availability": {
    "label": "Beschikbaarheid",
    "options": ["Te huur", "Verhuurd"],
    "value":""
  },
  "surfaceArea": {
    "label": "Woonoppervlakte m2",
    "value": "123"
  },
  "numRooms": {
    "label": "Aantal kamers",
    "value": "2"
  },
  "numBedrooms": {
    "label": "Aantal slaapkamers",
    "value": "2"
  },
  "numBathrooms": {
    "label": "Aantal badkamers",
    "value": "2"
  },
  "energyLabel": {
    "label": "Energielabel",
    "value": "A"
  },
  "balcony": {
    "label": "Balkon aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "garden": {
    "label": "Tuin aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "shower": {
    "label": "Douche aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "toilet": {
    "label": "Toilet aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "storage": {
    "label": "Bergruimte aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "shed": {
    "label": "Schuur aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "garage": {
    "label": "Garage aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "parking": {
    "label": "Parkeerruimte aanwezig",
    "options": ["Ja", "Nee", null],
    "value":""
  },
  "buildingType": {
    "label": "Soort bouw",
    "options": ["Bestaande bouw", "Nieuwbouw", null],
    "value":""
  },
  "interior": {
    "label": "Interieur",
    "options": ["Gemeubileerd", "Gestoffeerd", "Kaal", null],
    "value":""
  },
  "apartmentOrHouse": {
    "label": "Type woning",
    "options": ["Appartement", "Huis", null],
    "value":""
  },
}
Extract all the information needed for the response from the following text:    
"""

DESCRIPTION_PROMPT = """
{original_description}
{feature_list}
Maak van bovenstaande kenmerken een nuttige beschrijving voor een woningzoeker.

Tell me in Dutch about highlights near {address} in a fluent text of two paragraphs. Consider a few iterations of the text first, before sending the response. Let the text have an informative character. Next to this, also tell me about the public transport possibilities in the neighbourhood in a separate paragraph. Also add in a short description the possibilities for schools and supermarkets in a separate paragraph.
"""


class SecretManager:
    def __init__(
        self, project_id: str, client=secretmanager.SecretManagerServiceClient()
    ):
        self.project_id = project_id
        self.client = client

    def get(self, name: str):
        response = self.client.access_secret_version(
            {"name": f"projects/{self.project_id}/secrets/{name}/versions/latest"}
        )

        return response.payload.data.decode("UTF-8")


def call_gpt(prompt: str) -> str:
    # Get API key from Secret Manager
    sm = SecretManager(GOOGLE_PROJECT_ID)
    gpt_api_key = sm.get("gpt-api-key")
    openai.api_key = gpt_api_key

    # Call openai to get stuff from description
    completion = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful real estate agent"},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=1024,
        frequency_penalty=0,
        presence_penalty=0,
    )

    # print the completion
    # print(completion.choices[0].text)
    print(completion)

    return completion.choices[0].message.content


def run(request_json: dict):
    if "description" not in request_json:
        return "No description in request", 400

    if "address" not in request_json:
        return "No address in request", 400

    features_prompt = FEATURES_JSON_PROMPT
    if "prompt" not in request_json:
        print("No prompt provided, using default")
    else:
        features_prompt = request_json["prompt"]

    # print(f'Starting with description: {request_json["description"][0:150]}')

    listing_features = call_gpt(prompt=features_prompt + request_json["description"])

    listing_description = call_gpt(
        prompt=DESCRIPTION_PROMPT.format(
            original_description=request_json["description"],
            feature_list=listing_features,
            address=request_json["address"],
        )
    )

    print("Result:")
    print(listing_features)
    print(listing_description)

    return listing_features + "\n---\n" + listing_description


@functions_framework.http
def handler(request):
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
            "Access-Control-Max-Age": "3600",
        }

        return ("Success", 204, headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    request_json = request.get_json(silent=True) or {}

    response = run(request_json)

    # response = json.dumps(json.loads(run(request_json)))

    return (response, 200, headers)


if "__main__" in __name__:
    run(
        {
            "description": """
    Unieke kans om te huren in hartje Alkmaar!

Gerenoveerd, gemoderniseerd maar bovenal karakteristiek voormalig pakhuis op een prachtige ligging in de binnenstad van Alkmaar. Het betreft hier een stil gebied middenin de stad, gecombineerd met de sfeer en karakteristieke uitstraling van het oude centrum. Tevens is het gelegen op loopafstand van het NS-station, in de directe nabijheid van het historische Waagplein met haar gezellige terrassen, een kinderspeelplaats en andere voorzieningen (o.a. winkels en restaurants).

INDELING:
begane grond
Entree/hal voorzien van een betonnen vloer met antraciet grijze vloertegel, wanden voorzien van behang en een balkenplafond. De multifunctionele ruimte is bereikbaar via twee openslaande deuren met dubbele beglazing en is voorzien van een betonnen vloer, gips plafond en voorzetwanden. Deze ruimte kan voor diverse doeleinden worden gebruikt zoals bijvoorbeeld, logeerkamer, werkplaats, kantoor, opslag of een eigen invulling. Het is van oorsprong een garage. Er is een wasbak met koud water aanwezig en een aansluiting voor zowel wasmachine als droger. In deze multifunctionele ruimte bevindt zich nog een aparte berging met werkbank en opbergkasten.

Eerste verdieping
Middels een open trap is de overloop bereikbaar voorzien van een separaat toilet en een vaste kast voor opslag, hier bevindt zich ook de wasmachine en droger aansluiting en de C.V.-ketel. Het toilet beschikt over een wandtoilet met een fonteintje en een opbergkastje. De toiletruimte is betegeld met een witte wandtegel en strakke antraciet grijze vloertegel.
De woonkamer heeft een open keuken voorzien van een koelkast, combi magnetron, 4-pits kookplaat en een ingebouwde vaatwasser. Het aanrecht bestaat uit een kunststof blad, spoelbak en een mengkraan.
De woonkamer beschikt over een lamelpakket white wash eikenvloer, gestuukte wanden en een origineel balkenplafond. De woonkamer is heerlijk licht door drie paar openslaande deuren naar het balkon. De woning beschikt over een ruim balkon over de volle breedte. Het balkon heeft massieve eikenhouten plankenvloer en een mooi ijzeren hek. In de zomer kun je vanaf het begin van de middag tot in de avond heerlijk van het zonnetje genieten.

Tweede verdieping
Via een vaste trap is de overloop op de tweede verdieping bereikbaar. De tweede verdieping beschikt over twee slaapkamers. Slaapkamer 1 is voorzien van zichtbare originele balken. Via een mooie inloopkast/kamer bereik je de tweede slaapkamer. Deze ruime, lichte slaapkamer heeft een hoge, open balkenplafond tot aan de nok van het dak. De badkamer is in 2016 geheel vernieuwd. De wanden zijn betegeld tot aan het plafond met een grote, moderne bruingrijze wandtegel (betonlook). De badkamer heeft een dakraam, inbouwspots, stort- en handdouche, een glazen douchewand, wandtoilet en een heerlijk ligbad.

Bergvliering
Boven de badkamer en slaapkamer 1 is nog een bergzolder aanwezig, perfect voor opslag.

Bijzonderheden
- Sfeervol pand met veel karakter
- Gemeubileerd
- Gelegen middenin het historische stadscentrum van Alkmaar
- Waarborgsom van 1 maand huur
- Inclusief servicekosten en WIFI
- Gas, water en licht €150,- per maand
- Ingang huur 1 november 2023 tot 31 augustus 2024
    """,
            "address": "De Schans in Giessenlanden in Zuid-Holland",
        }
    )
