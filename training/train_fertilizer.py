import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import pickle

df = pd.read_csv("dataset/fertilizer.csv")

le_soil = LabelEncoder()
le_crop = LabelEncoder()

df["soil"] = le_soil.fit_transform(df["soil"])
df["crop"] = le_crop.fit_transform(df["crop"])

X = df.drop("fertilizer", axis=1)
y = df["fertilizer"]

model = RandomForestClassifier()
model.fit(X, y)

pickle.dump(model, open("backend/models/fertilizer_model.pkl", "wb"))

print("✅ Fertilizer model trained & saved")