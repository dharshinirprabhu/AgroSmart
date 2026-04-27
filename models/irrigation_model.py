import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder

# 📊 Load dataset
df = pd.read_csv("datasets/irrigation.csv")

# 🔄 Encode target (Yes/No → 1/0)
le = LabelEncoder()
df["water_needed"] = le.fit_transform(df["water_needed"])

# 🎯 Features & Target
X = df[["temperature", "humidity", "soil_moisture"]]
y = df["water_needed"]

# 🌳 Train model
model = DecisionTreeClassifier()
model.fit(X, y)


# 🔮 Prediction function
def predict_irrigation(data):
    temp = data.get("temperature", 30)
    humid = data.get("humidity", 60)
    moisture = data.get("soil_moisture", 40)

    input_data = [[temp, humid, moisture]]

    pred = model.predict(input_data)[0]

    result = le.inverse_transform([pred])[0]

    return {"water": result}