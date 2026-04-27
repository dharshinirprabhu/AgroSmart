from flask import Flask, request, jsonify
from gemini_helper import ask_gemini
from backend.models.model import predict_crop
from backend.models.fertilizer_model import predict_fertilizer
from flask import Flask, request, jsonify
import requests
# (add these later when ready)
# from backend.models.disease_model import predict_disease
from models.irrigation_model import predict_irrigation

API_KEY = "AIzaSyAcGyZs0mqShKmpk1uMMSqU2Y2LwkQXLwE"

app = Flask(__name__)

# 🌱 CROP PREDICTION
@app.route('/predict-crop', methods=['POST'])
def predict_crop_route():
    data = request.json

    input_data = [
        data['N'],
        data['P'],
        data['K'],
        data['temperature'],
        data['humidity'],
        data['ph'],
        data['rainfall']
    ]

    result = predict_crop(input_data)
    return jsonify({"crop": result})


# 🌿 FERTILIZER PREDICTION
@app.route('/predict-fertilizer', methods=['POST'])
def predict_fertilizer_route():
    data = request.json

    result = predict_fertilizer({
        "temperature": data['temperature'],
        "humidity": data['humidity'],
        "soil": data['soil'],
        "crop": data['crop'],
        "N": data['N'],
        "P": data['P'],
        "K": data['K']
    })

    return jsonify(result)


@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    data = request.json
    prompt = data.get("question")

    response = ask_gemini(prompt)

    return jsonify({"answer": response})

    

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/predict-irrigation', methods=['POST'])
def irrigation():
    data = request.json
    return jsonify(predict_irrigation(data))

@app.route("/ask", methods=["POST"])
def ask():
    import requests

    user_input = request.json.get("message")

    prompt = f"""
    You are a smart farming assistant.
    Give short, clear answers.

    Question: {user_input}
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"

    data = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    response = requests.post(url, json=data)
    result = response.json()

    try:
        answer = result["candidates"][0]["content"]["parts"][0]["text"]
    except:
        answer = "Error getting response"

    return jsonify({"reply": answer})