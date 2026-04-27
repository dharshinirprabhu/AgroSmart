import pandas as pd
from sklearn.neighbors import KNeighborsClassifier

# Load dataset
data = pd.read_csv("dataset.csv")

# Features and labels
X = data[['N','P','K','temperature','humidity','ph','rainfall']]
y = data['label']

# Model
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)

def predict_crop(input_data):
    return model.predict([input_data])[0]