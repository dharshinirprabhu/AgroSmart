import numpy as np
import json
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import load_img, img_to_array  


# Load model once
MODEL_PATH = "backend/models/disease_model.h5"
CLASSES_PATH = "backend/models/classes.json"

model = load_model(MODEL_PATH)

# Load class labels
with open(CLASSES_PATH, "r") as f:
    class_indices = json.load(f)

# Reverse mapping (index → label)
labels = {v: k for k, v in class_indices.items()}


def predict_disease(img_path):
    try:
        if not os.path.exists(img_path):
            return {"error": "Image file not found"}

        # Load and preprocess image
        img = load_img(img_path, target_size=(224, 224))
        img_array = img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Prediction
        prediction = model.predict(img_array)

        class_index = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        disease = labels[class_index]

        return {
            "disease": disease,
            "confidence": round(confidence * 100, 2)
        }

    except Exception as e:
        return {"error": str(e)}