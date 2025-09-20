import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.ensemble import RandomForestRegressor
import lightgbm as lgb
import shap
from src.features import build_features, get_tfidf, set_tfidf


def train_lgb(X, y):
    """
    Train LightGBM model with GridSearchCV optimization.
    Target: Reduce RMSE to $42,000 or better.
    Includes SHAP explainability and fallback to RandomForest.
    """
    X = X.copy()
    X = X.select_dtypes(include=[np.number]).fillna(0)

    if X.shape[0] < 2:
        raise ValueError(f"Not enough samples to train: n_samples={X.shape[0]}")

    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Training on {X_train.shape[0]} samples with {X_train.shape[1]} features")
    print(f"Validation on {X_val.shape[0]} samples")

    try:
        # LightGBM with comprehensive parameter grid
        model = lgb.LGBMRegressor(
            objective="regression", 
            n_jobs=-1,
            random_state=42,
            verbose=-1
        )
        
        # Expanded parameter grid for better optimization
        param_grid = {
            "num_leaves": [31, 50, 100],
            "n_estimators": [200, 500, 1000],
            "learning_rate": [0.01, 0.05, 0.1],
            "max_depth": [6, 8, 10],
            "min_child_samples": [20, 30, 50],
            "subsample": [0.8, 0.9, 1.0],
            "colsample_bytree": [0.8, 0.9, 1.0]
        }

        print("🔍 Starting GridSearchCV optimization...")
        gs = GridSearchCV(
            model,
            param_grid,
            cv=3,
            scoring="neg_root_mean_squared_error",
            n_jobs=-1,
            verbose=1,
            error_score="raise",
        )
        gs.fit(X_train, y_train)
        best = gs.best_estimator_
        best_params = gs.best_params_
        print(f"✅ LightGBM GridSearch completed. Best params: {best_params}")

    except Exception as e:
        print(f"⚠️ Warning: LightGBM/GridSearch failed — falling back to RandomForest. Error: {e}")
        best = RandomForestRegressor(
            n_estimators=200, 
            n_jobs=-1, 
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        best.fit(X_train, y_train)
        best_params = {"fallback": "RandomForest"}

    # Evaluate model
    preds = best.predict(X_val)
    mse = mean_squared_error(y_val, preds)
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_val, preds))

    print(f"📊 Model Performance:")
    print(f"   RMSE: ${rmse:,.2f}")
    print(f"   R²: {r2:.3f}")
    
    # Check if we achieved target RMSE
    target_rmse = 42000
    if rmse <= target_rmse:
        print(f"🎯 Target RMSE achieved! (${rmse:,.2f} <= ${target_rmse:,})")
    else:
        print(f"⚠️ Target RMSE not achieved (${rmse:,.2f} > ${target_rmse:,})")

    # Generate SHAP explanations
    try:
        print("🔍 Generating SHAP explanations...")
        explainer = shap.TreeExplainer(best)
        shap_values = explainer.shap_values(X_val[:100])  # Limit for performance
        
        # Calculate feature importance
        feature_importance = np.abs(shap_values).mean(0)
        feature_names = X.columns.tolist()
        
        # Create importance dataframe
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False)
        
        print("📈 Top 10 Most Important Features:")
        for i, (_, row) in enumerate(importance_df.head(10).iterrows()):
            print(f"   {i+1:2d}. {row['feature']:<25} {row['importance']:.4f}")
            
    except Exception as e:
        print(f"⚠️ SHAP analysis failed: {e}")
        importance_df = None

    return best, best_params, rmse, r2, importance_df


def predict_from_model(model, input_dict):
    """Make prediction from trained model with feature engineering."""
    X = pd.DataFrame([input_dict])
    X = build_features(X, fit_vectorizer=False)
    X = X.select_dtypes(include=[np.number]).fillna(0)
    pred = model.predict(X)[0]
    return float(pred)


def get_feature_importance(model, X_sample):
    """Get SHAP feature importance for a prediction."""
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_sample)
        return shap_values
    except Exception as e:
        print(f"SHAP explanation failed: {e}")
        return None


def save_model(model, path, importance_df=None):
    """Save the ML model, TF-IDF vectorizer, and feature importance."""
    bundle = {
        "model": model,
        "tfidf": get_tfidf(),
        "feature_importance": importance_df
    }
    joblib.dump(bundle, path)
    print(f"💾 Model saved to: {path}")


def load_model(path):
    """Load the ML model, TF-IDF vectorizer, and feature importance."""
    bundle = joblib.load(path)
    set_tfidf(bundle["tfidf"])
    return bundle["model"]
