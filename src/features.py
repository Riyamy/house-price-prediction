import numpy as np
import pandas as pd
from geopy.distance import geodesic
from sklearn.feature_extraction.text import TfidfVectorizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

# Global NLP tools
analyzer = SentimentIntensityAnalyzer()
tfidf = None   # will be fitted during training


def set_tfidf(vectorizer):
    """Store a fitted TF-IDF vectorizer (used in training)."""
    global tfidf
    tfidf = vectorizer


def get_tfidf():
    """Return the current TF-IDF vectorizer (for saving/loading)."""
    global tfidf
    return tfidf


def add_basic_features(df):
    """Add basic engineered features from property attributes."""
    df = df.copy()
    
    # Property age
    if "year_built" in df.columns:
        df["property_age"] = 2025 - df["year_built"].fillna(2025)
        df["is_new_property"] = (df["property_age"] <= 5).astype(int)
        df["is_old_property"] = (df["property_age"] >= 20).astype(int)
    
    # Area-based features
    if "area" in df.columns:
        df["area_sqrt"] = np.sqrt(df["area"])
        df["area_log"] = np.log1p(df["area"])
        df["is_large_property"] = (df["area"] >= 1500).astype(int)
        df["is_small_property"] = (df["area"] <= 800).astype(int)
    
    # Bedroom/bathroom ratios
    if "area" in df.columns and "bedrooms" in df.columns:
        df["area_per_bedroom"] = df["area"] / df["bedrooms"].replace(0, 1)
        df["bedroom_density"] = df["bedrooms"] / df["area"] * 1000  # bedrooms per 1000 sqft
    
    if "bedrooms" in df.columns and "bathrooms" in df.columns:
        df["bathroom_bedroom_ratio"] = df["bathrooms"] / df["bedrooms"].replace(0, 1)
        df["total_rooms"] = df["bedrooms"] + df["bathrooms"]
    
    # Property type indicators
    if "bedrooms" in df.columns:
        df["is_studio"] = (df["bedrooms"] == 1).astype(int)
        df["is_family_home"] = (df["bedrooms"] >= 3).astype(int)
        df["is_luxury"] = (df["bedrooms"] >= 4).astype(int)
    
    return df


def add_geo_features(df, ref_point=(12.9716, 77.5946)):
    """Add geospatial features based on location."""
    df = df.copy()
    
    if "lat" in df.columns and "lon" in df.columns:
        # Distance to city center
        def dist(row):
            try:
                return geodesic((row["lat"], row["lon"]), ref_point).km
            except Exception:
                return np.nan
        
        df["dist_to_cbd_km"] = df.apply(dist, axis=1)
        df["dist_to_cbd_km"] = df["dist_to_cbd_km"].fillna(df["dist_to_cbd_km"].mean())
        
        # Location-based features
        df["is_central"] = (df["dist_to_cbd_km"] <= 5).astype(int)
        df["is_suburban"] = (df["dist_to_cbd_km"] > 10).astype(int)
        
        # Coordinate-based features
        df["lat_normalized"] = (df["lat"] - df["lat"].min()) / (df["lat"].max() - df["lat"].min())
        df["lon_normalized"] = (df["lon"] - df["lon"].min()) / (df["lon"].max() - df["lon"].min())
        
        # Distance squared (for non-linear effects)
        df["dist_to_cbd_squared"] = df["dist_to_cbd_km"] ** 2
    
    return df


def add_nlp_features(df, desc_col="description", fit_vectorizer=False):
    """Add NLP-based features from property descriptions."""
    global tfidf
    df = df.copy()

    if desc_col in df.columns:
        # Basic text features
        df["desc_len"] = df[desc_col].fillna("").str.len()
        df["desc_words"] = df[desc_col].fillna("").str.split().str.len()
        df["avg_word_length"] = df[desc_col].fillna("").str.split().apply(
            lambda x: np.mean([len(word) for word in x]) if x else 0
        )
        
        # Sentiment analysis
        df["sentiment"] = df[desc_col].fillna("").apply(
            lambda t: analyzer.polarity_scores(t)["compound"]
        )
        df["sentiment_positive"] = (df["sentiment"] > 0.1).astype(int)
        df["sentiment_negative"] = (df["sentiment"] < -0.1).astype(int)
        
        # Keyword-based features
        luxury_keywords = ["luxury", "premium", "villa", "penthouse", "pool", "gym", "jacuzzi", "terrace"]
        location_keywords = ["metro", "station", "hub", "mall", "park", "school", "hospital"]
        condition_keywords = ["renovated", "modern", "new", "furnished", "maintained"]
        
        df["has_luxury_keywords"] = df[desc_col].fillna("").str.lower().apply(
            lambda x: sum(1 for word in luxury_keywords if word in x)
        )
        df["has_location_keywords"] = df[desc_col].fillna("").str.lower().apply(
            lambda x: sum(1 for word in location_keywords if word in x)
        )
        df["has_condition_keywords"] = df[desc_col].fillna("").str.lower().apply(
            lambda x: sum(1 for word in condition_keywords if word in x)
        )
        
        # Text complexity
        df["text_complexity"] = df["desc_words"] * df["avg_word_length"]
        
        # TF-IDF features (50 features)
        if fit_vectorizer or tfidf is None:
            tfidf = TfidfVectorizer(max_features=50, stop_words='english')
            tfidf_matrix = tfidf.fit_transform(df[desc_col].fillna("")).toarray()
        else:
            tfidf_matrix = tfidf.transform(df[desc_col].fillna("")).toarray()

        tfidf_df = pd.DataFrame(
            tfidf_matrix,
            columns=[f"tfidf_{i}" for i in range(tfidf_matrix.shape[1])]
        )

        df = pd.concat([df.reset_index(drop=True), tfidf_df.reset_index(drop=True)], axis=1)
        df = df.drop(columns=[desc_col])

    return df


def build_features(df, fit_vectorizer=False):
    """
    Build comprehensive feature set with 20+ predictive features.
    Combines basic, geospatial, and NLP features.
    """
    df = add_basic_features(df)
    df = add_geo_features(df)
    if "description" in df.columns:
        df = add_nlp_features(df, fit_vectorizer=fit_vectorizer)
    
    # Ensure we have numeric features only for ML
    df = df.select_dtypes(include=[np.number]).fillna(0)
    
    return df
