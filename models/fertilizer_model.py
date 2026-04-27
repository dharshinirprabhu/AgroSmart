import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Load dataset
df = pd.read_csv("datasets/fertilizer.csv")

# Encode categorical columns
le_soil = LabelEncoder()
le_crop = LabelEncoder()
le_fert = LabelEncoder()

df["soil_type"] = le_soil.fit_transform(df["soil_type"])
df["crop_type"] = le_crop.fit_transform(df["crop_type"])
df["fertilizer"] = le_fert.fit_transform(df["fertilizer"])

# Features & target
X = df[["temperature", "humidity", "soil_type", "crop_type", "N", "P", "K"]]
y = df["fertilizer"]

# Train model
model = RandomForestClassifier()
model.fit(X, y)


def predict_fertilizer(data):
    soil = le_soil.transform([data["soil"]])[0]
    crop = le_crop.transform([data["crop"]])[0]

    input_data = [[
        data["temperature"],
        data["humidity"],
        soil,
        crop,
        data["N"],
        data["P"],
        data["K"]
    ]]

    pred = model.predict(input_data)[0]
    result = le_fert.inverse_transform([pred])[0]

    return {"fertilizer": result}