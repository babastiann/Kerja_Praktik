"""
ml_service.py — Python FastAPI untuk prediksi harga rumah Bandung
Menserve model .pkl yang sudah dibuat.

Install:
  pip install fastapi uvicorn scikit-learn pandas numpy joblib

Jalankan:
  uvicorn ml_service:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import json
import time
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Path model ────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent.parent.parent  # naik 3 level: ml → backend → root  # root project
MODEL_DIR  = BASE_DIR / "models"
DATA_DIR   = BASE_DIR

MODEL_PATH  = MODEL_DIR / "model_rumah_bandung.pkl"
SCALER_PATH = MODEL_DIR / "scaler_rumah_bandung.pkl"
FITUR_PATH  = MODEL_DIR / "fitur_model.pkl"
DATASET_PATH= DATA_DIR  / "dataset_bandung_clean.csv"

# ── Load model ────────────────────────────────────────────────
model  = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

try:
    fitur_names = joblib.load(FITUR_PATH)
except Exception:
    fitur_names = ["luas_tanah", "luas_bangunan", "kamar_tidur", "kamar_mandi", "garasi", "lokasi_encoded"]

# Daftar lokasi unik (untuk encoding)
try:
    df_ref = pd.read_csv(DATASET_PATH, usecols=["LOKASI"])
    df_ref["lokasi_clean"] = df_ref["LOKASI"].str.split(",").str[0].str.strip()
    LOKASI_LIST = sorted(df_ref["lokasi_clean"].unique().tolist())
except Exception:
    LOKASI_LIST = []

LOKASI_INDEX = {loc: i for i, loc in enumerate(LOKASI_LIST)}

app = FastAPI(title="ML Service Rumah Bandung", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Schemas ───────────────────────────────────────────────────
class PredictRequest(BaseModel):
    lokasi:         str
    luas_tanah:     float
    luas_bangunan:  float
    kamar_tidur:    int = 3
    kamar_mandi:    int = 2
    garasi:         int = 1
    fasilitas:      List[str] = []
    model:          str = "RFR"

class RetrainRequest(BaseModel):
    model_name: str = "RFR"
    retrain_id: Optional[int] = None

# ── Helper: encode input ──────────────────────────────────────
def encode_input(req: PredictRequest) -> pd.DataFrame:
    """Encode input request menjadi feature vector sesuai model."""
    lokasi_enc = LOKASI_INDEX.get(req.lokasi, len(LOKASI_INDEX) // 2)

    # Coba kedua kemungkinan nama kolom (huruf besar & kecil)
    row_upper = {
        "LUAS_TANAH_NUMERIC":    req.luas_tanah,
        "LUAS_BANGUNAN_NUMERIC": req.luas_bangunan,
        "KAMAR_TIDUR_NUMERIC":   req.kamar_tidur,
        "KAMAR_MANDI_NUMERIC":   req.kamar_mandi,
        "GARASI":                req.garasi,
        "lokasi_encoded":        lokasi_enc,
        "jumlah_fasilitas":      len(req.fasilitas),
    }

    row_lower = {
        "luas_tanah":       req.luas_tanah,
        "luas_bangunan":    req.luas_bangunan,
        "kamar_tidur":      req.kamar_tidur,
        "kamar_mandi":      req.kamar_mandi,
        "garasi":           req.garasi,
        "lokasi_encoded":   lokasi_enc,
        "jumlah_fasilitas": len(req.fasilitas),
    }

    # Pilih row sesuai fitur_names yang ada di model
    if fitur_names and fitur_names[0].isupper():
        row = row_upper
    else:
        row = row_lower

    df = pd.DataFrame([row])

    # Filter hanya kolom yang dikenal model
    available = [f for f in fitur_names if f in df.columns]
    if available:
        df = df[available]

    return df  # kembalikan DataFrame, bukan .values
# ── Endpoint: predict ─────────────────────────────────────────
@app.post("/predict")
def predict(req: PredictRequest):
    try:
        X_df = encode_input(req)

        try:
            X_scaled = scaler.transform(X_df)
        except Exception:
            X_scaled = X_df.values

        pred = model.predict(X_scaled)[0]
        harga_pred = max(int(pred), 100_000_000)

        confidence = 85.0
        try:
            if hasattr(model, "estimators_"):
                preds = np.array([tree.predict(X_scaled)[0] for tree in model.estimators_])
                std   = preds.std()
                cv    = std / (harga_pred + 1e-9)
                confidence = max(60.0, min(97.0, round(100 * (1 - cv), 1)))
        except Exception:
            pass

        margin = harga_pred * 0.08
        return {
            "harga_prediksi":  harga_pred,
            "harga_min":       int(harga_pred - margin),
            "harga_max":       int(harga_pred + margin),
            "confidence":      confidence,
            "model_digunakan": req.model,
            "lokasi":          req.lokasi,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ── Endpoint: retrain ─────────────────────────────────────────
@app.post("/retrain")
def retrain(req: RetrainRequest):
    """Retrain model menggunakan dataset terbaru."""
    try:
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.tree import DecisionTreeRegressor
        from sklearn.linear_model import LinearRegression
        from sklearn.preprocessing import StandardScaler
        from sklearn.model_selection import cross_val_score, train_test_split
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

        df = pd.read_csv(DATASET_PATH)

        # Feature engineering
        df["lokasi_clean"] = df["LOKASI"].str.split(",").str[0].str.strip()
        df["lokasi_encoded"] = df["lokasi_clean"].map(LOKASI_INDEX).fillna(0)
        df["jumlah_fasilitas"] = 0  # bisa dikembangkan

        features = ["LUAS_TANAH_NUMERIC", "LUAS_BANGUNAN_NUMERIC",
                    "KAMAR_TIDUR_NUMERIC", "KAMAR_MANDI_NUMERIC",
                    "GARASI", "lokasi_encoded", "jumlah_fasilitas"]
        target   = "HARGA_NUMERIC"

        df_clean = df[features + [target]].dropna()
        X = df_clean[features].values
        y = df_clean[target].values

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        new_scaler = StandardScaler()
        X_train_s  = new_scaler.fit_transform(X_train)
        X_test_s   = new_scaler.transform(X_test)

        # Pilih model
        model_map = {
            "RFR":      RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
            "DTR":      DecisionTreeRegressor(random_state=42),
            "MLR":      LinearRegression(),
            "Ensemble": RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
        }
        clf = model_map.get(req.model_name, model_map["RFR"])
        clf.fit(X_train_s, y_train)
        y_pred = clf.predict(X_test_s)

        r2   = round(float(r2_score(y_test, y_pred)), 4)
        mae  = round(float(mean_absolute_error(y_test, y_pred)), 2)
        rmse = round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 2)

        # Simpan model baru
        joblib.dump(clf,        MODEL_PATH)
        joblib.dump(new_scaler, SCALER_PATH)
        joblib.dump(features,   FITUR_PATH)

        # Update global
        global model, scaler, fitur_names
        model       = clf
        scaler      = new_scaler
        fitur_names = features

        return {
            "r2_baru":       r2,
            "mae_baru":      mae,
            "rmse_baru":     rmse,
            "dataset_size":  len(df_clean),
            "model_name":    req.model_name,
            "retrain_id":    req.retrain_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Endpoint: feature importance ──────────────────────────────
@app.get("/feature-importance")
def feature_importance():
    try:
        if not hasattr(model, "feature_importances_"):
            return {"data": []}
        importances = model.feature_importances_
        names = fitur_names if len(fitur_names) == len(importances) else [f"f{i}" for i in range(len(importances))]
        pairs = sorted(zip(names, importances), key=lambda x: x[1], reverse=True)
        COLORS = ["#14b8a6","#f97316","#a855f7","#f43f5e","#f59e0b","#22d3ee","#a3e635"]
        return {
            "data": [
                {"feature": n, "value": round(v * 100, 1), "color": COLORS[i % len(COLORS)]}
                for i, (n, v) in enumerate(pairs)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Endpoint: lokasi list ─────────────────────────────────────
@app.get("/lokasi")
def get_lokasi():
    return {"lokasi": LOKASI_LIST}

# ── Health check ──────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "model": str(MODEL_PATH.name), "lokasi_count": len(LOKASI_LIST)}
