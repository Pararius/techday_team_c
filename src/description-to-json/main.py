import openai
import json
from google.cloud import secretmanager

GOOGLE_PROJECT_ID = "techday-team-c"

PROMPT = """
Extract all the information needed for the response from the following text in dutch:
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


def get_features_from_description(prompt: str) -> str:
    # Get API key from Secret Manager
    sm = SecretManager(GOOGLE_PROJECT_ID)
    gpt_api_key = sm.get("gpt-api-key")
    openai.api_key = gpt_api_key

    # Call openai to get stuff from description
    completion = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=0.4,
        max_tokens=1024,
        frequency_penalty=0,
        presence_penalty=0,
    )

    # print the completion
    # print(completion.choices[0].text)
    print(completion)

    if completion.choices[0].text is None:
        return "{}"
    else:
        return completion.choices[0].text


def run(request_json: dict):
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

    return listing_data, 200


def handler(request):
    request_json = request.get_json(silent=True) or {}

    return run(request_json)


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
    """
        }
    )
