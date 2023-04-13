import openai
import json
from treehouse.security import SecretManager

GOOGLE_PROJECT_ID = "techday-team-c"

def get_features_from_description(description:str, prompt:str) -> dict:

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

    prompt = "Extract information for a listing from this description: "
    if "prompt" not in request_json:
        print("No prompt provided, using default")  
    else:
        prompt = request_json["prompt"]             

    print(f'Starting with description: {request_json["description"][0:150]}')

    listing_data = get_features_from_description(
        description=request_json["description"], 
        prompt=prompt)

    print("Result:")
    print(listing_data)

    return json.dumps(listing_data), 200