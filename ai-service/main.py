from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

rain_classifier = joblib.load("models/rain_model.pkl")
rain_regressor  = joblib.load("models/rain_regressor.pkl")
fire_model      = joblib.load("models/fire_model.pkl")

class RainRequest(BaseModel):
    temperatures: list[float]
    humidity: list[float]
    pressure: list[float]
    wind_speed: list[float]
    precipitation_prob: list[float]

class FireRequest(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    fire_weather_index: float
    soil_moisture: float
    vegetation_type: int

@app.post("/predict/rain")
def predict_rain(req: RainRequest):
    results_prob  = []
    results_rain  = []
    results_mm    = []

    for i in range(7):
        idx = min(i, len(req.temperatures) - 1)
        features = np.array([[
            req.temperatures[idx],
            req.humidity[idx],
            req.pressure[idx],
            req.wind_speed[idx],
            req.precipitation_prob[idx]
        ]])
        prob     = float(rain_classifier.predict_proba(features)[0][1])
        will_rain = bool(rain_classifier.predict(features)[0])
        mm       = float(rain_regressor.predict(features)[0]) if will_rain else 0.0

        results_prob.append(round(prob, 3))
        results_rain.append(will_rain)
        results_mm.append(round(max(mm, 0.0), 2))

    return {
        "rain_probability": results_prob,
        "will_rain":        results_rain,
        "expected_mm":      results_mm
    }

@app.post("/predict/fire")
def predict_fire(req: FireRequest):
    features = np.array([[
        req.temperature,
        req.humidity,
        req.wind_speed,
        req.fire_weather_index,
        req.soil_moisture,
        req.vegetation_type
    ]])

    risk_score = float(fire_model.predict_proba(features)[0][1])

    if risk_score > 0.7:
        level = "high"
    elif risk_score > 0.4:
        level = "medium"
    else:
        level = "low"

    return {
        "risk_score": round(risk_score, 3),
        "risk_level": level
    }