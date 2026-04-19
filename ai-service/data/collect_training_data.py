#!/usr/bin/env python3
"""
Collect NASA FIRMS fire detections for Macedonia and match with
Open-Meteo historical weather data to build a fire model training dataset.

Usage:
    python collect_training_data.py --api-key YOUR_FIRMS_KEY
    python collect_training_data.py --api-key YOUR_FIRMS_KEY --start-year 2019 --end-year 2024

Get your free FIRMS MAP Key at: https://firms.modaps.eosdis.nasa.gov/api/area/
"""
import argparse
import os
import sys
import time
from datetime import datetime, timedelta
from io import StringIO

import numpy as np
import pandas as pd
import requests

# Macedonia bounding box: W, S, E, N
BBOX = "20.45,40.85,23.03,42.36"

FIRMS_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"
OPENMETEO_URL = "https://archive-api.open-meteo.com/v1/archive"

# Macedonia fire season: May–October
NON_FIRE_MONTHS = [11, 12, 1, 2, 3]


# ---------------------------------------------------------------------------
# FIRMS download
# ---------------------------------------------------------------------------

def download_firms(api_key: str, source: str, start_year: int, end_year: int) -> pd.DataFrame:
    """Download fire detections for Macedonia in 10-day batches."""
    chunks = []
    current = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    batch_num = 0

    print(f"Downloading {source} detections for Macedonia ({start_year}–{end_year})...")

    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        url = f"{FIRMS_URL}/{api_key}/{source}/{BBOX}/5/{date_str}"
        try:
            resp = requests.get(url, timeout=30)
            if resp.status_code == 401:
                print("\nInvalid API key.")
                print("Register at: https://firms.modaps.eosdis.nasa.gov/api/area/")
                sys.exit(1)
            if resp.status_code == 200 and "latitude" in resp.text:
                df = pd.read_csv(StringIO(resp.text))
                if not df.empty:
                    chunks.append(df)
                    print(f"  {date_str}: {len(df)} detections", end="\r", flush=True)
        except Exception as e:
            print(f"\n  Warning – {date_str}: {e}")

        current += timedelta(days=5)
        batch_num += 1
        # Respect FIRMS rate limit (~30 req/min)
        if batch_num % 10 == 0:
            time.sleep(2)
        else:
            time.sleep(0.5)

    print()
    return pd.concat(chunks, ignore_index=True) if chunks else pd.DataFrame()


# ---------------------------------------------------------------------------
# Open-Meteo weather fetch
# ---------------------------------------------------------------------------

def fetch_daily_weather(lat: float, lon: float, date_str: str) -> dict | None:
    """Return daily aggregated weather for a location/date from Open-Meteo archive."""
    params = {
        "latitude": round(lat, 3),
        "longitude": round(lon, 3),
        "start_date": date_str,
        "end_date": date_str,
        "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,soil_moisture_0_to_7cm",
        "timezone": "Europe/Skopje",
        "wind_speed_unit": "kmh",
    }
    try:
        resp = requests.get(OPENMETEO_URL, params=params, timeout=15)
        if resp.status_code != 200:
            return None
        hourly = resp.json().get("hourly", {})
        temp = [x for x in hourly.get("temperature_2m", []) if x is not None]
        hum = [x for x in hourly.get("relative_humidity_2m", []) if x is not None]
        wind = [x for x in hourly.get("wind_speed_10m", []) if x is not None]
        soil = [x for x in hourly.get("soil_moisture_0_to_7cm", []) if x is not None]
        if not temp:
            return None
        return {
            "temperature": round(max(temp), 1),
            "humidity": round(min(hum), 1) if hum else 50.0,
            "wind_speed": round(max(wind), 1) if wind else 10.0,
            "soil_moisture": round(float(np.mean(soil)), 3) if soil else 0.3,
        }
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Feature helpers
# ---------------------------------------------------------------------------

def compute_fwi(temp: float, humidity: float, wind: float) -> float:
    """Simplified Fire Weather Index (0–100).
    Higher temperature, lower humidity, and higher wind increase risk."""
    fwi = (temp * 0.6) - (humidity * 0.5) + (wind * 0.4) + 30
    return round(max(0.0, min(100.0, fwi)), 1)


def get_vegetation_type(lat: float, lon: float) -> int:
    """Vegetation type based on Macedonia's broad geographic zones.
    0 = sparse/shrubland  1 = mixed forest  2 = dense/conifer"""
    if lon < 21.3:              # Western ranges (Mavrovo, Pelister, Shar)
        return 2
    elif lon > 22.5 and lat < 41.8:   # Eastern Strumica lowlands
        return 0
    else:
        return 1


# ---------------------------------------------------------------------------
# Process FIRMS detections
# ---------------------------------------------------------------------------

def process_firms(df: pd.DataFrame) -> pd.DataFrame:
    """Filter by confidence and snap to a 0.25° grid to reduce API calls."""
    if df.empty:
        return df

    if "confidence" in df.columns:
        col = df["confidence"].astype(str).str.strip().str.lower()
        if col.isin(["l", "n", "h"]).any():      # VIIRS: 'l', 'n', 'h'
            df = df[col != "l"]
        else:                                     # MODIS or numeric
            df = df[pd.to_numeric(df["confidence"], errors="coerce").fillna(0) >= 30]

    df = df.copy()
    df["lat_grid"] = (df["latitude"] // 0.25 * 0.25 + 0.125).round(3)
    df["lon_grid"] = (df["longitude"] // 0.25 * 0.25 + 0.125).round(3)
    df["date"] = pd.to_datetime(df["acq_date"]).dt.strftime("%Y-%m-%d")

    return df[["lat_grid", "lon_grid", "date"]].drop_duplicates().reset_index(drop=True)


# ---------------------------------------------------------------------------
# Build training dataset
# ---------------------------------------------------------------------------

def build_dataset(
    fire_events: pd.DataFrame,
    output_csv: str,
    weather_cache_csv: str,
) -> pd.DataFrame:

    # Load weather cache so the script is safely re-runnable
    if os.path.exists(weather_cache_csv):
        cache_df = pd.read_csv(weather_cache_csv)
        cache: dict = {
            (r["lat"], r["lon"], r["date"]): r.to_dict()
            for _, r in cache_df.iterrows()
        }
    else:
        cache = {}

    rows = []

    def get_weather(lat, lon, date) -> dict | None:
        key = (lat, lon, date)
        if key not in cache:
            wx = fetch_daily_weather(lat, lon, date)
            if wx:
                cache[key] = {"lat": lat, "lon": lon, "date": date, **wx}
            time.sleep(0.35)
        return cache.get(key)

    def make_row(wx: dict, lat: float, lon: float, fire: int) -> dict:
        return {
            "temperature": wx["temperature"],
            "humidity": wx["humidity"],
            "wind_speed": wx["wind_speed"],
            "fire_weather_index": compute_fwi(wx["temperature"], wx["humidity"], wx["wind_speed"]),
            "soil_moisture": wx["soil_moisture"],
            "vegetation_type": get_vegetation_type(lat, lon),
            "fire_occurred": fire,
        }

    # --- Fire samples (label = 1) ---
    print(f"\nFetching weather for {len(fire_events)} fire events...")
    for i, (_, ev) in enumerate(fire_events.iterrows()):
        wx = get_weather(ev["lat_grid"], ev["lon_grid"], ev["date"])
        if wx:
            rows.append(make_row(wx, ev["lat_grid"], ev["lon_grid"], 1))
        if (i + 1) % 100 == 0:
            print(f"  {i + 1}/{len(fire_events)} fire events processed")

    fire_count = len(rows)
    print(f"Fire samples: {fire_count}")

    # --- Non-fire samples (label = 0) ---
    # For each unique fire location, pick 3 winter-month dates per year.
    # This keeps the dataset balanced and geographically representative.
    rng = np.random.default_rng(42)
    unique_locs = fire_events[["lat_grid", "lon_grid"]].drop_duplicates().values
    fire_dates = set(fire_events["date"])

    years = sorted(pd.to_datetime(fire_events["date"]).dt.year.unique())
    non_fire_tasks = []
    for lat, lon in unique_locs:
        for year in years:
            sampled_months = rng.choice(NON_FIRE_MONTHS, size=3, replace=False)
            for month in sampled_months:
                day = int(rng.integers(1, 28))
                date = f"{year}-{month:02d}-{day:02d}"
                if date not in fire_dates:
                    non_fire_tasks.append((lat, lon, date))

    print(f"Fetching weather for {len(non_fire_tasks)} non-fire samples...")
    for i, (lat, lon, date) in enumerate(non_fire_tasks):
        wx = get_weather(lat, lon, date)
        if wx:
            rows.append(make_row(wx, lat, lon, 0))
        if (i + 1) % 200 == 0:
            print(f"  {i + 1}/{len(non_fire_tasks)} non-fire samples processed")

    # Persist cache after all fetching
    if cache:
        pd.DataFrame(cache.values()).to_csv(weather_cache_csv, index=False)
        print(f"Weather cache saved: {weather_cache_csv}")

    df = pd.DataFrame(rows)
    df.to_csv(output_csv, index=False)
    non_fire_count = len(df) - fire_count
    print(f"\nDataset saved to {output_csv}")
    print(f"  Total: {len(df)} rows  ({fire_count} fire  /  {non_fire_count} non-fire)")
    return df


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Build Macedonia fire model training data from NASA FIRMS + Open-Meteo"
    )
    parser.add_argument(
        "--api-key", required=True,
        help="NASA FIRMS MAP Key — get one free at https://firms.modaps.eosdis.nasa.gov/api/area/"
    )
    parser.add_argument("--start-year", type=int, default=2019)
    parser.add_argument("--end-year",   type=int, default=2024)
    parser.add_argument(
        "--source", default="VIIRS_SNPP_SP",
        choices=["VIIRS_SNPP_SP", "MODIS_SP"],
        help="FIRMS archive source (default: VIIRS_SNPP_SP — covers 2012+)"
    )
    args = parser.parse_args()

    raw_csv           = "data/fire_detections_raw.csv"
    weather_cache_csv = "data/weather_cache.csv"
    output_csv        = "data/macedonia_training_data.csv"

    # Step 1 — FIRMS detections (cached after first run)
    if os.path.exists(raw_csv):
        print(f"Loading cached FIRMS data from {raw_csv}")
        raw_df = pd.read_csv(raw_csv)
    else:
        raw_df = download_firms(args.api_key, args.source, args.start_year, args.end_year)
        if raw_df.empty:
            print("No detections returned. Verify your API key and try again.")
            sys.exit(1)
        raw_df.to_csv(raw_csv, index=False)
        print(f"Raw detections saved: {raw_csv}  ({len(raw_df)} rows)")

    # Step 2 — Process into unique grid-snapped fire events
    fire_events = process_firms(raw_df)
    print(f"Unique fire events (0.25° grid): {len(fire_events)}")
    if fire_events.empty:
        print("No high-confidence detections after filtering.")
        sys.exit(1)

    # Step 3 — Collect weather and build final dataset
    build_dataset(fire_events, output_csv, weather_cache_csv)


if __name__ == "__main__":
    main()
