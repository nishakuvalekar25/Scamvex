# Scamvex 🛡️

### AI-Powered Scam Message Detection and Risk Analysis System

Scamvex is an AI-powered web application that analyzes suspicious SMS,
emails, and messages to identify potential scams and provide an
easy-to-understand risk assessment.

The system combines **Machine Learning, rule-based red-flag detection,
risk scoring, OCR, and MongoDB** to help users understand whether a
message is potentially dangerous.

------------------------------------------------------------------------

## 🚀 Features

-   🔍 **Scam Message Detection** --- Classifies messages as scam or
    legitimate using a trained Machine Learning model.
-   📊 **Risk Score** --- Generates a risk score using the model's scam
    probability and detected red flags.
-   🚨 **Red Flag Detection** --- Identifies suspicious patterns such as
    urgency, threats, requests for sensitive information, and suspicious
    offers.
-   🏷️ **Scam Category Detection** --- Identifies the possible category
    of a suspicious message.
-   💡 **Safety Recommendation** --- Provides an actionable
    recommendation based on the detected risk level.
-   🖼️ **OCR-Based Message Extraction** --- Extracts text from uploaded
    screenshots/images using Tesseract OCR.
-   📜 **Analysis History** --- Stores recent analysis results in
    MongoDB and retrieves them through the API.
-   🌐 **Web Interface** --- Provides a simple interface for submitting
    messages and viewing analysis results.

------------------------------------------------------------------------

## 🧠 How It Works

``` text
User
  │
  ├── Enter Message ───────────────┐
  │                                │
  └── Upload Screenshot             │
           │                        │
           ▼                        │
      Tesseract OCR                 │
           │                        │
           ▼                        ▼
       Extracted Text ───────► ML Prediction
                                      │
                                      ▼
                              Red Flag Detection
                                      │
                                      ▼
                                Risk Engine
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
               Risk Score        Risk Level         Category
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      ▼
                              Recommendation
                                      │
                                      ▼
                              Analysis Result
                                      │
                                      ▼
                                 MongoDB Atlas
```

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React.js
-   JavaScript
-   HTML
-   CSS
-   Vite

### Backend

-   Python
-   FastAPI
-   Uvicorn
-   REST API

### Machine Learning

-   Scikit-learn
-   Joblib
-   Text Classification

### Database

-   MongoDB Atlas
-   PyMongo

### OCR

-   Tesseract OCR
-   Pytesseract
-   Pillow

### Tools

-   Git
-   GitHub
-   VS Code

------------------------------------------------------------------------

## 🏗️ Project Structure

``` text
Scamvex/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── prepare_dataset.py
│   ├── red_flag_engine.py
│   ├── requirements.txt
│   ├── risk_engine.py
│   └── train_model.py
│
├── data/
│   ├── scamvex_dataset.csv
│   ├── sms_spam_collection.zip
│   └── SMSSpamCollection
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── model/
│   └── scam_model.pkl
│
├── Dockerfile
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## 🔄 Application Workflow

### 1. Message Input

The user enters a suspicious message into Scamvex.

### 2. Machine Learning Prediction

The trained ML model analyzes the message and predicts whether it is a
scam. The model also provides a probability for the scam class.

### 3. Red Flag Detection

The message is checked for suspicious patterns and red flags.

### 4. Risk Calculation

The ML scam probability and detected red flags are combined by the risk
engine to calculate an overall risk score.

### 5. Risk Level

The risk score is converted into a meaningful risk level.

### 6. Scam Category

Scamvex identifies the possible category of the message.

### 7. Safety Recommendation

A recommendation is generated based on the detected risk level.

### 8. Database Storage

The analysis result is stored in MongoDB for history.

------------------------------------------------------------------------

## 🤖 Machine Learning

Scamvex uses a trained Machine Learning text-classification model to
identify potentially fraudulent messages.

The model receives the message as input and produces a prediction and
scam probability.

``` text
Message
   ↓
Trained ML Model
   ↓
Prediction + Scam Probability
   ↓
Risk Engine
   ↓
Final Risk Assessment
```

The trained model is stored as:

``` text
model/scam_model.pkl
```

The backend loads the model using Joblib during application startup.

------------------------------------------------------------------------

## 📊 Risk Analysis

Scamvex does not rely only on the Machine Learning prediction. It
combines multiple signals to produce a more interpretable assessment.

``` text
ML Scam Probability
        +
Detected Red Flags
        ↓
   Risk Engine
        ↓
   Risk Score
        ↓
   Risk Level
        ↓
Recommendation
```

The result helps the user understand not only the prediction, but also
the potential level of risk.

------------------------------------------------------------------------

## 🖼️ OCR Analysis

Scamvex supports image-based analysis.

A user can upload a screenshot of a suspicious message. The OCR system
extracts the text, which can then be analyzed by Scamvex.

``` text
Screenshot
    ↓
Tesseract OCR
    ↓
Extracted Text
    ↓
Scam Analysis
    ↓
Risk Assessment
```

This is useful when the suspicious message is available only as an image
or screenshot.

------------------------------------------------------------------------

## 🗄️ Database

MongoDB Atlas is used to store analysis history.

An analysis can contain:

-   Original message
-   Prediction
-   Scam probability
-   Risk score
-   Risk level
-   Scam category
-   Detected red flags
-   Safety recommendation
-   Timestamp

MongoDB is accessed from the FastAPI backend using PyMongo.

------------------------------------------------------------------------

## 🔌 API Endpoints

### `GET /`

Checks whether the Scamvex API is running.

Example response:

``` json
{
  "message": "Welcome to Scamvex API",
  "status": "running"
}
```

### `POST /analyze`

Analyzes a text message and returns the prediction, scam probability,
risk score, risk level, category, red flags, and recommendation.

### `POST /ocr`

Accepts an image file and extracts text using Tesseract OCR.

### `GET /history`

Returns recent analysis history stored in MongoDB.

------------------------------------------------------------------------

## ⚙️ Local Setup

### 1. Clone the Repository

``` bash
git clone https://github.com/nishakuvalekar25/Scamvex.git
cd Scamvex
```

### 2. Backend Setup

Create a virtual environment:

``` bash
python -m venv venv
```

Activate it on Windows:

``` bash
venv\Scripts\activate
```

Install backend dependencies:

``` bash
pip install -r backend/requirements.txt
```

### 3. Environment Variables

Create:

``` text
backend/.env
```

Add your MongoDB Atlas connection string:

``` env
MONGO_URI=your_mongodb_connection_string
```

Do not commit `.env` to GitHub.

### 4. Run the Backend

``` bash
cd backend
uvicorn main:app --reload
```

The API will be available at:

``` text
http://127.0.0.1:8000
```

### 5. Run the Frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🔐 Security

Sensitive configuration values such as the MongoDB connection string are
stored using environment variables.

The `.env` file is excluded from version control using `.gitignore`.

------------------------------------------------------------------------

## 🔮 Future Improvements

-   Improve model performance using a larger and more diverse dataset
-   Add explainable AI features
-   Support multilingual scam detection
-   Add URL and domain reputation analysis
-   Add email-specific scam detection
-   Improve OCR preprocessing
-   Add user authentication
-   Add analytics and visualization dashboard
-   Complete cloud deployment
-   Integrate real-time threat intelligence

------------------------------------------------------------------------

## 🎯 Project Goal

The goal of Scamvex is to make scam detection more accessible by
combining Machine Learning with understandable risk analysis.

Instead of simply returning **"Scam" or "Not Scam"**, Scamvex provides a
broader assessment through:

**Prediction + Risk Score + Red Flags + Category + Recommendation**

------------------------------------------------------------------------

## 👩‍💻 Author

**Nisha Kuvalekar**

GitHub: [@nishakuvalekar25](https://github.com/nishakuvalekar25)

------------------------------------------------------------------------

## 📌 Project Status

**Active Development**

Core scam analysis, risk assessment, OCR processing, MongoDB storage,
and web interface have been implemented.
