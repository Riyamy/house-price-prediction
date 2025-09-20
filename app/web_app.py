from flask import Flask, render_template, request, jsonify
import pandas as pd
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.features import build_features
from src.model import load_model, predict_from_model

app = Flask(__name__)

# Model path
MODEL_PATH = "models/lgb_model.pkl"

# ✅ Load model immediately at startup (Flask 3.x removed before_first_request)
try:
    model = load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"⚠️ Failed to load model at startup: {e}")
    model = None

@app.route("/")
def index():
    """Serve the main web application"""
    return render_template('index.html')

@app.route("/predict", methods=["POST"])
def predict():
    """Predict house price from property features"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        data = request.get_json()
        if not data:
            return jsonify({"error": "No input provided"}), 400

        # Convert JSON → DataFrame → Feature Engineering
        df = pd.DataFrame([data])
        df = build_features(df)

        # Convert back to dict (for predict_from_model)
        processed_input = df.to_dict(orient="records")[0]

        # Predict
        pred = predict_from_model(model, processed_input)
        return jsonify({"prediction": float(pred)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze():
    """Advanced market analysis endpoint"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        data = request.get_json()
        if not data:
            return jsonify({"error": "No input provided"}), 400

        # Get base prediction
        df = pd.DataFrame([data])
        df = build_features(df)
        processed_input = df.to_dict(orient="records")[0]
        base_price = predict_from_model(model, processed_input)

        # Market analysis
        area = data.get("area", 1200)
        bedrooms = data.get("bedrooms", 3)
        year_built = data.get("year_built", 2015)
        
        # Calculate metrics
        price_per_sqft = base_price / area
        property_age = 2025 - year_built
        
        # Market insights
        market_analysis = {
            "base_prediction": float(base_price),
            "price_per_sqft": float(price_per_sqft),
            "property_age": property_age,
            "market_score": "A+" if price_per_sqft > 100 else "B+",
            "roi_potential": "8.5%" if property_age < 10 else "6.2%",
            "confidence_range": {
                "lower": float(base_price * 0.85),
                "upper": float(base_price * 1.15)
            },
            "market_insights": {
                "luxury_premium": "+$50k" if price_per_sqft > 120 else "Standard",
                "location_premium": "+$40k" if data.get("lat", 12.9716) > 12.95 else "Standard",
                "age_discount": "-$20k" if property_age > 20 else "No discount"
            }
        }
        
        return jsonify(market_analysis)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": pd.Timestamp.now().isoformat()
    })

@app.route("/api/features", methods=["POST"])
def get_features():
    """Get engineered features for a property"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input provided"}), 400

        # Convert JSON → DataFrame → Feature Engineering
        df = pd.DataFrame([data])
        df = build_features(df)
        
        # Convert to dict for JSON response
        features = df.to_dict(orient="records")[0]
        
        return jsonify({
            "features": features,
            "feature_count": len(features)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/market-data", methods=["GET"])
def get_market_data():
    """Get market data and trends"""
    try:
        # Simulate market data
        market_data = {
            "trends": {
                "price_growth": "8.5%",
                "luxury_growth": "12%",
                "central_premium": "15%",
                "new_construction_premium": "15%"
            },
            "amenities": {
                "metro_station": {"distance": "0.8 km", "impact": "+$15k"},
                "shopping_mall": {"distance": "1.2 km", "impact": "+$8k"},
                "hospital": {"distance": "2.1 km", "impact": "+$5k"},
                "school": {"distance": "0.5 km", "impact": "+$12k"},
                "park": {"distance": "0.3 km", "impact": "+$10k"},
                "airport": {"distance": "25 min", "impact": "+$20k"}
            },
            "transportation": {
                "metro": "5 min walk",
                "bus_stop": "2 min walk",
                "highway": "8 min drive",
                "airport": "25 min drive"
            }
        }
        
        return jsonify(market_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run Flask web application
    app.run(host="0.0.0.0", port=5000, debug=True)
