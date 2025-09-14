import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import mean_squared_error
from lightgbm import LGBMRegressor

# Load data
df = pd.read_csv("data/house_prices_sample.csv")

X = df.drop(columns=["price"])
y = df["price"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

numeric_cols = ["area", "bedrooms", "bathrooms", "year_built", "latitude", "longitude"]
text_col = "description"

# Preprocessing
preprocessor = ColumnTransformer([
    ("num", StandardScaler(), numeric_cols),
    ("txt", TfidfVectorizer(max_features=500, ngram_range=(1,2)), text_col)
])

pipeline = Pipeline([
    ("pre", preprocessor),
    ("model", LGBMRegressor(random_state=42))
])

# Grid search
param_grid = {
    "model__n_estimators": [200],
    "model__learning_rate": [0.05, 0.1],
    "model__num_leaves": [31, 64]
}

grid = GridSearchCV(pipeline, param_grid, cv=3, scoring="neg_root_mean_squared_error", n_jobs=-1)
grid.fit(X_train, y_train)

preds = grid.predict(X_test)
rmse = mean_squared_error(y_test, preds, squared=False)
print("Best params:", grid.best_params_)
print("Test RMSE:", rmse)

joblib.dump(grid.best_estimator_, "models/lgbm_pipeline.joblib")
print("Model saved to models/lgbm_pipeline.joblib")
