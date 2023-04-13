def handler(request):

    request_json = request.get_json(silent=True) or {}

    if "description" not in request_json:
        return "No description in request", 400

    print(request_json["description"])

    return "Done", 200