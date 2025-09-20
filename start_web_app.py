#!/usr/bin/env python3
"""
House Price Prediction Engine - Web Application Starter
"""

import sys
import os
import webbrowser
from threading import Timer

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, 'app'))

def open_browser():
    """Open the web browser after a short delay"""
    webbrowser.open('http://localhost:5000')

def main():
    """Start the web application"""
    print("🏠 House Price Prediction Engine - Web Application")
    print("=" * 50)
    
    try:
        from app.web_app import app
        
        print("✅ Model loaded successfully")
        print("🚀 Starting web server...")
        print("🌐 Web application will be available at: http://localhost:5000")
        print("📊 Health check: http://localhost:5000/health")
        print("")
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Open browser after 2 seconds
        Timer(2.0, open_browser).start()
        
        # Start the Flask app
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
