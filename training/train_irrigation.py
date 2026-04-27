import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# Load dataset
df = pd.read_csv("../dataset/irrigation_prediction.csv")

print("Dataset shape:", df.shape)

# Features & target
X = df.drop("irrigation", axis=1)
y = df["irrigation"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Accuracy
acc = accuracy_score(y_test, y_pred)
print("Accuracy:", acc)

# Save model inside model/ folder
os.makedirs("../model", exist_ok=True)
joblib.dump(model, "../model/irrigation_model.pkl")

print("Model saved in model/irrigation_model.pkl")