import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

os.makedirs("models", exist_ok=True)

# ============================================================
# RAIN MODEL - synthetic data
# ============================================================
np.random.seed(42)
n = 1000

rain_data = pd.DataFrame({
    "temperature":        np.random.uniform(-5, 40, n),
    "humidity":           np.random.uniform(20, 100, n),
    "pressure":           np.random.uniform(980, 1030, n),
    "wind_speed":         np.random.uniform(0, 80, n),
    "precipitation_prob": np.random.uniform(0, 100, n),
})

rain_data["will_rain"] = (
    (rain_data["humidity"] > 70) &
    (rain_data["precipitation_prob"] > 40)
).astype(int)

rain_data["expected_mm"] = np.where(
    rain_data["will_rain"] == 1,
    np.random.uniform(0.5, 30, n),
    0.0
)

features_rain = ["temperature", "humidity", "pressure", "wind_speed", "precipitation_prob"]

X_rain = rain_data[features_rain]
y_rain_class = rain_data["will_rain"]
y_rain_mm    = rain_data["expected_mm"]

X_train, X_test, y_train, y_test = train_test_split(X_rain, y_rain_class, test_size=0.2)

rain_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
rain_classifier.fit(X_train, y_train)
print(f"Rain classifier accuracy: {rain_classifier.score(X_test, y_test):.2f}")

rain_regressor = RandomForestRegressor(n_estimators=100, random_state=42)
rain_regressor.fit(X_rain, y_rain_mm)

joblib.dump(rain_classifier, "models/rain_model.pkl")
joblib.dump(rain_regressor,  "models/rain_regressor.pkl")
print("Rain models saved.")

# ============================================================
# FIRE MODEL - UCI dataset + synthetic fallback
# ============================================================
try:
    df = pd.read_csv("data/forestfires.csv")
    month_map = {"jan":1,"feb":2,"mar":3,"apr":4,"may":5,"jun":6,
                 "jul":7,"aug":8,"sep":9,"oct":10,"nov":11,"dec":12}
    day_map   = {"mon":1,"tue":2,"wed":3,"thu":4,"fri":5,"sat":6,"sun":7}
    df["month"] = df["month"].map(month_map)
    df["day"]   = df["day"].map(day_map)
    df["fire_occurred"] = (df["area"] > 0).astype(int)
    df["vegetation_type"] = np.random.randint(0, 3, len(df))
    df["fire_weather_index"] = df["FFMC"] * 0.1
    df["soil_moisture"] = np.random.uniform(0.1, 0.9, len(df))
    df = df.rename(columns={"temp": "temperature", "RH": "humidity", "wind": "wind_speed"})
    features_fire = ["temperature", "humidity", "wind_speed", "fire_weather_index", "soil_moisture", "vegetation_type"]
    X_fire = df[features_fire]
    y_fire = df["fire_occurred"]
    print("Using UCI Forest Fire dataset.")
except FileNotFoundError:
    print("UCI dataset not found, using synthetic data.")
    fire_data = pd.DataFrame({
        "temperature":        np.random.uniform(10, 45, n),
        "humidity":           np.random.uniform(10, 100, n),
        "wind_speed":         np.random.uniform(0, 80, n),
        "fire_weather_index": np.random.uniform(0, 100, n),
        "soil_moisture":      np.random.uniform(0.05, 0.9, n),
        "vegetation_type":    np.random.randint(0, 3, n),
    })
    fire_data["fire_occurred"] = (
        (fire_data["temperature"] > 30) &
        (fire_data["humidity"] < 30) &
        (fire_data["fire_weather_index"] > 50)
    ).astype(int)
    X_fire = fire_data[["temperature", "humidity", "wind_speed",
                         "fire_weather_index", "soil_moisture", "vegetation_type"]]
    y_fire = fire_data["fire_occurred"]

X_tr, X_te, y_tr, y_te = train_test_split(X_fire, y_fire, test_size=0.2, random_state=42)
fire_model = RandomForestClassifier(n_estimators=100, random_state=42)
fire_model.fit(X_tr, y_tr)
print(f"Fire model accuracy: {fire_model.score(X_te, y_te):.2f}")

joblib.dump(fire_model, "models/fire_model.pkl")
print("Fire model saved.")
print("All models trained and saved successfully!")