import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.model import train_lgb, predict_from_model
from src.features import build_features
import pandas as pd
import numpy as np

def test_imports():
    """Test that all modules can be imported successfully"""
    import src.features
    import src.model
    import src.data
    assert True

def test_feature_engineering():
    """Test feature engineering pipeline"""
    data = {
        'area': [1000, 1500, 800],
        'bedrooms': [2, 3, 1],
        'bathrooms': [1, 2, 1],
        'year_built': [2010, 2015, 2005],
        'lat': [12.97, 12.98, 12.96],
        'lon': [77.59, 77.60, 77.58],
        'description': ["Nice 2BHK", "Spacious 3BHK", "Compact 1BHK"],
        'price': [100000, 150000, 80000]
    }
    df = pd.DataFrame(data)
    df_with_features = build_features(df)
    
    # Check that features were added
    assert len(df_with_features.columns) > len(df.columns)
    assert 'property_age' in df_with_features.columns
    assert 'sentiment' in df_with_features.columns

def test_training_and_prediction():
    """Test model training and prediction"""
    data = {
        'area': [1000, 1500, 800, 1200, 900],
        'bedrooms': [2, 3, 1, 2, 2],
        'bathrooms': [1, 2, 1, 2, 1],
        'year_built': [2010, 2015, 2005, 2012, 2008],
        'lat': [12.97, 12.98, 12.96, 12.97, 12.95],
        'lon': [77.59, 77.60, 77.58, 77.59, 77.57],
        'description': ["Nice 2BHK", "Spacious 3BHK", "Compact 1BHK", "Modern 2BHK", "Cozy 2BHK"],
        'price': [100000, 150000, 80000, 120000, 95000]
    }
    df = pd.DataFrame(data)
    
    # Build features
    df_with_features = build_features(df)
    X = df_with_features.drop(columns=['price'])
    y = df['price']
    
    # Train model
    model, _, rmse, r2, _ = train_lgb(X, y)
    
    # Test prediction
    inp = {
        'area': 1200,
        'bedrooms': 2,
        'bathrooms': 2,
        'year_built': 2012,
        'lat': 12.97,
        'lon': 77.59,
        'description': 'Modern 2BHK flat'
    }
    
    # Build features for input
    inp_df = pd.DataFrame([inp])
    inp_with_features = build_features(inp_df)
    inp_processed = inp_with_features.to_dict(orient="records")[0]
    
    pred = predict_from_model(model, inp_processed)
    
    # Assertions
    assert pred > 0, f"Prediction should be positive, got {pred}"
    assert isinstance(pred, (int, float, np.number)), f"Prediction should be numeric, got {type(pred)}"
    assert rmse > 0, f"RMSE should be positive, got {rmse}"
    # R² can be NaN with very small datasets, so we check if it's either valid or NaN
    assert np.isnan(r2) or (0 <= r2 <= 1), f"R² should be between 0 and 1 or NaN, got {r2}"
