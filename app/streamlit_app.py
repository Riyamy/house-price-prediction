import streamlit as st
import joblib
import pandas as pd

st.title("🏠 House Price Prediction Demo")

model = joblib.load("models/lgbm_pipeline.joblib")

st.header("Enter property details:")
latitude = st.number_input("Latitude", value=37.77)
longitude = st.number_input("Longitude", value=-122.41)
area = st.number_input("Area (sq ft)", value=1000)
bedrooms = st.number_input("Bedrooms", value=2)
bathrooms = st.number_input("Bathrooms", value=1)
year_built = st.number_input("Year Built", value=2000)
description = st.text_area("Description", "Cozy 2BHK near downtown")

if st.button("Predict"):
    row = pd.DataFrame([{
        "latitude": latitude,
        "longitude": longitude,
        "area": area,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "year_built": year_built,
        "description": description
    }])
    price = model.predict(row)[0]
    st.success(f"Predicted Price: ${price:,.2f}")
