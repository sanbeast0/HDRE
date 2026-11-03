"""
HDRE Machine Learning Demand & Deficit Forecasting Pipeline.
Trains XGBoost 2.0+ Regressors for multi-horizon (30, 60, 90 days) ward deficit forecasting
using historical SCADA metering and gridded meteorological telemetries.
Strictly implements Section 6.2 and Section 8.1 hyperparameter specifications.
"""
import os
import json
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from typing import Dict, List, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "hdre_ward_training_dataset.csv")
MODEL_DIR = os.path.dirname(__file__)

FEATURE_COLS = [
    'ward_id_code',
    'month',
    'season_id',
    'population',
    'growth_rate',
    'baseline_lpcd',
    'elevation_head_m',
    'pipe_age_years',
    'slum_pop_ratio',
    'hospital_beds_count',
    'esr_capacity_kl',
    'temp_max_c',
    'temp_min_c',
    'humidity_pct',
    'rainfall_mm',
    'soil_moisture_idx',
    'temp_max_lag_14d',
    'temp_anomaly',
    'precip_deficit_30d',
    'inlet_flow_mld',
    'inlet_flow_lag_7d',
    'terminal_pressure_bar',
    'estimated_leakage_pct',
    'private_tanker_trips',
    'historic_unmet_ratio'
]

XGB_PARAMS = {
    "n_estimators": 450,
    "max_depth": 6,
    "learning_rate": 0.03,
    "subsample": 0.85,
    "colsample_bytree": 0.80,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "objective": "reg:squarederror",
    "tree_method": "hist",
    "random_state": 42
}

def load_and_preprocess_data():
    """Loads CSV and engineers ward encoding and numeric features."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Ward dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    # Encode ward_id as integer 0..14
    ward_mapping = {f"WARD_{i:02d}": i - 1 for i in range(1, 16)}
    df['ward_id_code'] = df['ward_id'].map(ward_mapping)
    return df, ward_mapping

def train_all_horizons() -> Dict[str, Any]:
    """Trains separate XGBoost regressors for 30d, 60d, and 90d unmet demand ratios."""
    df, ward_mapping = load_and_preprocess_data()
    metrics = {}

    horizons = {
        30: "target_unmet_demand_ratio_30d",
        60: "target_unmet_demand_ratio_60d",
        90: "target_unmet_demand_ratio_90d"
    }

    print("[ML] Starting XGBoost Multi-Horizon Model Training...")

    for h, target_col in horizons.items():
        # Drop rows where target is NaN (future lookahead boundary)
        valid_df = df.dropna(subset=[target_col] + FEATURE_COLS).copy()
        
        X = valid_df[FEATURE_COLS]
        y = valid_df[target_col]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, shuffle=True
        )

        model = xgb.XGBRegressor(**XGB_PARAMS)
        model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )

        y_pred = model.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        mae = float(mean_absolute_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        model_path = os.path.join(MODEL_DIR, f"xgboost_{h}d.json")
        model.save_model(model_path)

        metrics[f"{h}d"] = {
            "horizon_days": h,
            "target": target_col,
            "test_rmse": round(rmse, 4),
            "test_mae": round(mae, 4),
            "test_r2": round(r2, 4),
            "sample_count": len(valid_df),
            "model_path": model_path
        }
        print(f"[ML] Horizon {h}-Day: RMSE={rmse:.4f}, MAE={mae:.4f}, R2={r2:.4f}")

    # Save feature names & metadata
    meta = {
        "features": FEATURE_COLS,
        "ward_mapping": ward_mapping,
        "hyperparameters": XGB_PARAMS,
        "metrics": metrics
    }
    with open(os.path.join(MODEL_DIR, "model_config.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print("[ML] Training completed successfully. Artifacts saved.")
    return metrics

class WardDemandForecaster:
    """Predictive inference engine for localized ward water deficit forecasting."""

    _models = {}
    _meta = None

    @classmethod
    def load_models(cls):
        """Loads serialized XGBoost models into memory."""
        if not cls._models:
            for h in [30, 60, 90]:
                path = os.path.join(MODEL_DIR, f"xgboost_{h}d.json")
                if os.path.exists(path):
                    m = xgb.XGBRegressor()
                    m.load_model(path)
                    cls._models[h] = m
                else:
                    print(f"[ML WARN] Model {path} not found. Will trigger train.")
            
            meta_path = os.path.join(MODEL_DIR, "model_config.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    cls._meta = json.load(f)

    @classmethod
    def forecast(
        cls,
        horizon_days: int = 60,
        temp_surge_c: float = 0.0,
        precip_deficit_pct: float = 0.0,
        latest_telemetry: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, float]:
        """
        Generates ward-level forecasted unmet demand ratios for the given horizon.
        """
        cls.load_models()
        valid_horizon = 30 if horizon_days <= 45 else (60 if horizon_days <= 75 else 90)

        if valid_horizon not in cls._models:
            train_all_horizons()
            cls.load_models()

        model = cls._models.get(valid_horizon)

        results = {}
        if not latest_telemetry:
            # Fallback based on metadata
            for i in range(1, 16):
                wid = f"WARD_{i:02d}"
                results[wid] = 0.12
            return results

        # Construct feature vector for each ward
        ward_rows = []
        ward_ids = []
        for row in latest_telemetry:
            wid = row["ward_id"]
            code = int(wid.split("_")[1]) - 1
            
            # Apply climate shock stresses to current features
            temp_max = float(row.get("temp_max_c", 30.0)) + float(temp_surge_c)
            temp_anomaly = float(row.get("temp_anomaly", 0.0)) + float(temp_surge_c)
            precip_deficit = min(100.0, max(0.0, float(row.get("precip_deficit_30d", 50.0)) - float(precip_deficit_pct)))
            
            feat = {
                'ward_id_code': code,
                'month': int(row.get('month', 5)),
                'season_id': int(row.get('season_id', 2)),
                'population': float(row.get('population', 250000)),
                'growth_rate': float(row.get('growth_rate', 0.02)),
                'baseline_lpcd': float(row.get('baseline_lpcd', 55.0)),
                'elevation_head_m': float(row.get('elevation_head_m', 570.0)),
                'pipe_age_years': float(row.get('pipe_age_years', 15.0)),
                'slum_pop_ratio': float(row.get('slum_pop_ratio', 0.2)),
                'hospital_beds_count': float(row.get('hospital_beds_count', 300)),
                'esr_capacity_kl': float(row.get('esr_capacity_kl', 6500)),
                'temp_max_c': temp_max,
                'temp_min_c': float(row.get('temp_min_c', 16.0)),
                'humidity_pct': float(row.get('humidity_pct', 40.0)),
                'rainfall_mm': max(0.0, float(row.get('rainfall_mm', 0.0))),
                'soil_moisture_idx': float(row.get('soil_moisture_idx', 0.25)),
                'temp_max_lag_14d': float(row.get('temp_max_lag_14d', 29.0)),
                'temp_anomaly': temp_anomaly,
                'precip_deficit_30d': precip_deficit,
                'inlet_flow_mld': float(row.get('inlet_flow_mld', 30.0)),
                'inlet_flow_lag_7d': float(row.get('inlet_flow_lag_7d', 30.0)),
                'terminal_pressure_bar': float(row.get('terminal_pressure_bar', 1.25)),
                'estimated_leakage_pct': float(row.get('estimated_leakage_pct', 14.0)),
                'private_tanker_trips': float(row.get('private_tanker_trips', 10)),
                'historic_unmet_ratio': float(row.get('historic_unmet_ratio', 0.08))
            }
            ward_rows.append(feat)
            ward_ids.append(wid)

        df_in = pd.DataFrame(ward_rows)[FEATURE_COLS]
        if model:
            preds = model.predict(df_in)
            for wid, pred in zip(ward_ids, preds):
                results[wid] = float(np.clip(pred, 0.0, 0.65))
        else:
            for wid in ward_ids:
                results[wid] = 0.14

        return results

if __name__ == "__main__":
    train_all_horizons()
