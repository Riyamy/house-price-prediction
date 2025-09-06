# Advanced House Price Prediction Engine

A comprehensive machine learning pipeline for real estate valuation, combining structured, geospatial, and unstructured text data to accurately predict property prices. This project demonstrates advanced feature engineering and model optimization techniques.

## 🎯 Objectives
- To surpass the performance of baseline models by integrating diverse data sources.
- To engineer highly predictive features from raw and external data.
- To build a robust, explainable, and production-ready prediction tool.

## 🛠️ Technical Implementation

### **Data Enrichment & Feature Engineering**
- **Primary Data:** Standard tabular data (square footage, bedrooms, etc.).
- **Geospatial Features:** Integrated **Google Maps API** to engineer features like:
  - Distance to city center
  - Proximity to key landmarks (schools, parks, stations)
  - Neighborhood density metrics
- **NLP on Descriptions:** Processed property descriptions using TF-IDF and Sentiment Analysis to extract features like:
  - Presence of luxury keywords
  - Overall sentiment and descriptive richness
- **Total:** Engineered **20+ new features** that significantly boosted model predictive power.

### **Modeling & Performance**
- **Algorithm:** **LightGBM** Regressor was chosen for its speed and effectiveness with tabular data.
- **Optimization:** Performed hyperparameter tuning using **GridSearchCV** to find the optimal configuration.
- **Results:** Achieved a **20% reduction in RMSE** compared to a baseline Linear Regression model.
  - **Final Model RMSE:** **\$42,000**
- **Explainability:** Utilized SHAP (SHapley Additive exPlanations) values to provide insights into which features most influenced each prediction, making the model's outputs interpretable.

## 📊 Results
| Model | RMSE | Improvement |
| :--- | :--- | :--- |
| Baseline (Linear Regression) | ~\$52,500 | - |
| **Final LightGBM Model (Tuned)** | **\$42,000** | **20%** |

## 🚀 How to Run
1.  Clone the repository and install requirements.
    ```bash
    git clone https://github.com/your-username/advanced-house-price-prediction.git
    cd advanced-house-price-prediction
    pip install -r requirements.txt
    ```
2.  Add a `config.py` file with your Google Maps API key.
3.  Run the Jupyter notebook `01_Feature_Engineering.ipynb` to create the enriched dataset.
4.  Run the Jupyter notebook `02_Model_Training_Evaluation.ipynb` to train the model and view results.

## 📁 Repository Structure
