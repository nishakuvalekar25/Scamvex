import os
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import joblib
from PIL import Image
import io
import pytesseract

from database import analyses_collection

from red_flag_engine import detect_red_flags
from risk_engine import (
    calculate_risk_score,
    get_risk_level,
    detect_category,
    get_recommendation,
)


# =========================
# TESSERACT OCR CONFIG
# =========================

tesseract_cmd = os.getenv("TESSERACT_CMD")

if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


# =========================
# CREATE FASTAPI APP
# =========================

app = FastAPI(
    title="Scamvex API",
    description="AI-powered scam message detection API",
    version="1.0.0",
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# LOAD TRAINED ML MODEL
# =========================

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "model" / "scam_model.pkl"

model = joblib.load(MODEL_PATH)


# =========================
# REQUEST FORMAT
# =========================

class MessageRequest(BaseModel):
    message: str


# =========================
# HOME ENDPOINT
# =========================

@app.get("/")
def home():
    return {
        "message": "Welcome to Scamvex API",
        "status": "running",
    }


# =========================
# SCAM ANALYSIS ENDPOINT
# =========================

@app.post("/analyze")
def analyze_message(request: MessageRequest):

    message = request.message

    # Check empty message
    if not message.strip():
        return {
            "error": "Message cannot be empty"
        }

    # =========================
    # ML PREDICTION
    # =========================

    prediction = model.predict([message])[0]

    # Get probability for scam class
    probabilities = model.predict_proba([message])[0]
    classes = model.classes_

    scam_index = list(classes).index("scam")
    scam_probability = probabilities[scam_index]

    # =========================
    # RED FLAG DETECTION
    # =========================

    red_flags = detect_red_flags(message)

    # =========================
    # RISK SCORE
    # =========================

    risk_score = calculate_risk_score(
        scam_probability,
        red_flags
    )

    # =========================
    # RISK LEVEL
    # =========================

    risk_level = get_risk_level(risk_score)

    # =========================
    # SCAM CATEGORY
    # =========================

    category = detect_category(message)

    # =========================
    # SAFETY RECOMMENDATION
    # =========================

    recommendation = get_recommendation(risk_level)

    # Convert probability to percentage
    scam_probability_percent = round(
        scam_probability * 100,
        2
    )

    # =========================
    # SAVE ANALYSIS TO MONGODB
    # =========================

    try:

        analyses_collection.insert_one({
            "message": message,
            "prediction": str(prediction),
            "scam_probability": scam_probability_percent,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "category": category,
            "red_flags": red_flags,
            "recommendation": recommendation,
            "created_at": datetime.utcnow(),
        })

        print("Analysis saved to MongoDB successfully.")

    except Exception as e:

        # MongoDB failure should NOT stop Scamvex analysis
        print(f"MongoDB save failed: {e}")

    # =========================
    # FINAL RESPONSE
    # =========================

    return {
        "prediction": prediction,
        "scam_probability": scam_probability_percent,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "category": category,
        "red_flags": red_flags,
        "recommendation": recommendation,
    }


# =========================
# OCR ENDPOINT
# =========================

@app.post("/ocr")
async def extract_text_from_image(
    file: UploadFile = File(...)
):

    try:

        # Read uploaded image
        contents = await file.read()

        # Convert bytes to image
        image = Image.open(
            io.BytesIO(contents)
        )

        # Extract text using Tesseract
        text = pytesseract.image_to_string(
            image
        )

        # Return extracted text
        return {
            "text": text.strip()
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# ANALYSIS HISTORY ENDPOINT
# =========================

@app.get("/history")
def get_history():

    try:

        history = list(
            analyses_collection
            .find(
                {},
                {
                    "_id": 0
                }
            )
            .sort(
                "created_at",
                -1
            )
            .limit(50)
        )

        return {
            "count": len(history),
            "history": history
        }

    except Exception as e:

        return {
            "error": f"Unable to retrieve history: {str(e)}"
        }