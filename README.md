# House Price Prediction Engine

End-to-end ML project with:
- Geospatial + NLP feature engineering
- LightGBM with GridSearchCV
- SHAP explainability
- Streamlit demo app

## Quickstart
```bash
pip install -r requirements.txt
python src/train.py --data-path data/house_prices_sample.csv --out-dir models
streamlit run app/streamlit_app.py
```

⚠️ Note: `data/house_prices_sample.csv` is a **small synthetic dataset** for demo purposes.  
For real experiments, please use a dataset like [Kaggle House Prices](https://www.kaggle.com/c/house-prices-advanced-regression-techniques).
