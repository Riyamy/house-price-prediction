import streamlit as st
import requests
import json

st.set_page_config(page_title="🏠 House Price Prediction Engine", layout="centered")

st.title("🏠 House Price Prediction Engine")
st.markdown("Enter property details below to estimate the price:")

# Backend API URL
API_URL = "http://127.0.0.1:5000/predict"

# User inputs
area = st.number_input("Area (sqft)", min_value=100, max_value=10000, value=1200)
bedrooms = st.number_input("Number of Bedrooms", min_value=1, max_value=10, value=3)
bathrooms = st.number_input("Number of Bathrooms", min_value=1, max_value=10, value=2)
year_built = st.number_input("Year Built", min_value=1900, max_value=2025, value=2012)
lat = st.number_input("Latitude", value=12.97, format="%.5f")
lon = st.number_input("Longitude", value=77.59, format="%.5f")
description = st.text_area("Property Description", "3BHK near IT hub")

# Predict button
if st.button("🔮 Predict Price"):
    input_dict = {
        "area": area,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "year_built": year_built,
        "lat": lat,
        "lon": lon,
        "description": description
    }

    try:
        # Send request to Flask API
        response = requests.post(API_URL, json=input_dict)

        if response.status_code == 200:
            result = response.json()
            pred_price = result.get("prediction")
            st.success(f"💰 Predicted Price: ${pred_price:,.2f}")
        else:
            st.error(f"API Error: {response.text}")

    except Exception as e:
        st.error(f"❌ Connection failed: {e}")
