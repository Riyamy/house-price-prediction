import streamlit as st
from src.model import load_model, predict_from_model

st.title("🏠 House Price Prediction Demo")
st.write("Enter property details and get an estimated price.")

area = st.number_input("Area (sqft)", value=1000)
bedrooms = st.number_input("Bedrooms", value=3)
bathrooms = st.number_input("Bathrooms", value=2)
year_built = st.number_input("Year built", value=2010)
lat = st.number_input("Latitude", value=12.9716)
lon = st.number_input("Longitude", value=77.5946)
description = st.text_input("Property description", "3BHK near IT hub")

if st.button("Predict"):
    model = load_model("models/lgb_model.pkl")
    inp = {"area": area, "bedrooms": bedrooms, "bathrooms": bathrooms,
           "year_built": year_built, "lat": lat, "lon": lon,
           "description": description}
    pred = predict_from_model(model, inp)
    st.metric("Predicted price (USD)", f"${pred:,.2f}")
