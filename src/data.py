import pandas as pd
from src.features import build_features

def load_data(path: str, fit_vectorizer: bool = False):
    df = pd.read_csv(path)

    if "price" not in df.columns:
        raise ValueError('CSV must contain a "price" column')

    y = df["price"]
    X = df.drop(columns=["price"])
    X = X.fillna(0)

    # apply feature engineering
    X = build_features(X, fit_vectorizer=fit_vectorizer)

    return X, y
