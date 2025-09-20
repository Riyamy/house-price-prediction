import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import time
import subprocess
import threading
from app.api_server import app

def test_api_endpoints():
    """Test API endpoints"""
    # Test data
    test_data = {
        "area": 1200,
        "bedrooms": 3,
        "bathrooms": 2,
        "year_built": 2015,
        "lat": 12.9716,
        "lon": 77.5946,
        "description": "3BHK near IT hub"
    }
    
    # Test with Flask test client
    with app.test_client() as client:
        # Test predict endpoint
        response = client.post('/predict', json=test_data)
        assert response.status_code == 200
        data = response.get_json()
        assert 'prediction' in data
        assert data['prediction'] > 0
        
        # Test analyze endpoint
        response = client.post('/analyze', json=test_data)
        assert response.status_code == 200
        data = response.get_json()
        assert 'base_prediction' in data
        assert 'price_per_sqft' in data
        assert 'market_score' in data
        
        # Test health endpoint
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert 'status' in data
        assert data['status'] == 'healthy'
