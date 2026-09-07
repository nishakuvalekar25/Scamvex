import joblib

import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report


# 1. Load dataset
df = pd.read_csv("data/scamvex_dataset.csv")

# 2. Remove missing values
df = df.dropna(subset=["message", "label"])

# 3. Separate input and output
X = df["message"]
y = df["label"]

# 4. Split dataset into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# 5. Create ML pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2)
    )),
    ("classifier", LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
))
])

# 6. Train model
print("Training model...")
model.fit(X_train, y_train)

# Save trained model
joblib.dump(model, "model/scam_model.pkl")
print("Model saved successfully!")

# 7. Test model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\nModel Training Complete!")
print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# 8. Test some example messages
test_messages = [
    "Congratulations! You have won 10 lakh rupees. Click here to claim your prize.",
    "Hey, are you coming to college tomorrow?",
    "URGENT! Your bank account will be blocked. Verify your details immediately.",
    "Your order has been shipped and will arrive tomorrow."
]

print("\nExample Predictions:")

for message in test_messages:
    prediction = model.predict([message])[0]
    probability = model.predict_proba([message]).max()

    print("\nMessage:", message)
    print("Prediction:", prediction)
    print(f"Confidence: {probability * 100:.2f}%")