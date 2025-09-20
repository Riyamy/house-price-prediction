// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const predictionForm = document.getElementById('predictionForm');
const resultCard = document.getElementById('resultCard');
const analysisCard = document.getElementById('analysisCard');
const priceAmount = document.getElementById('priceAmount');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const analysisContent = document.getElementById('analysisContent');
const currencySelect = document.getElementById('currencySelect');

// Currency conversion
const USD_TO_INR_RATE = 83.5; // Current approximate rate
let currentPrediction = 0;
let currentCurrency = 'USD';

// Mobile Navigation
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Currency conversion functions
function convertToINR(usdAmount) {
    return Math.round(usdAmount * USD_TO_INR_RATE);
}

function convertToUSD(inrAmount) {
    return Math.round(inrAmount / USD_TO_INR_RATE);
}

function formatCurrency(amount, currency) {
    if (currency === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`;
    } else {
        return `$${amount.toLocaleString('en-US')}`;
    }
}

function formatMarketInsight(insight) {
    // Extract amount and currency from insight string
    const match = insight.match(/([+-]?\$?\d+[kK]?)/);
    if (match) {
        let amount = match[1];
        let isUSD = amount.includes('$');
        
        // Remove $ and k/K, convert to number
        amount = amount.replace(/[$,kK]/g, '');
        if (amount.includes('k') || amount.includes('K')) {
            amount = amount.replace(/[kK]/g, '') + '000';
        }
        
        const numAmount = parseInt(amount);
        
        if (currentCurrency === 'INR' && isUSD) {
            const inrAmount = convertToINR(numAmount);
            return insight.replace(match[1], formatCurrency(inrAmount, 'INR'));
        } else if (currentCurrency === 'USD' && !isUSD) {
            const usdAmount = convertToUSD(numAmount);
            return insight.replace(match[1], formatCurrency(usdAmount, 'USD'));
        }
    }
    return insight;
}

function updatePriceDisplay() {
    if (currentPrediction > 0) {
        let displayAmount = currentPrediction;
        if (currentCurrency === 'INR') {
            displayAmount = convertToINR(currentPrediction);
        }
        priceAmount.textContent = formatCurrency(displayAmount, currentCurrency);
    }
}

// Currency selector event listener
if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        updatePriceDisplay();
        updateHeroStats();
        
        // Sync with hero buttons
        const currencyButtons = document.querySelectorAll('.currency-btn');
        currencyButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.currency === currentCurrency) {
                btn.classList.add('active');
            }
        });
    });
}

// Hero section currency buttons
document.addEventListener('DOMContentLoaded', () => {
    const currencyButtons = document.querySelectorAll('.currency-btn');
    currencyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currencyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCurrency = btn.dataset.currency;
            updatePriceDisplay();
            updateHeroStats();
            
            // Sync with currency selector
            if (currencySelect) {
                currencySelect.value = currentCurrency;
            }
        });
    });
    
    // Initialize live prediction with default value
    const livePrediction = document.querySelector('.live-prediction-price');
    if (livePrediction) {
        const defaultPrice = 125375; // Default USD price
        currentPrediction = defaultPrice;
        updateHeroStats();
    }
});

// Update hero section stats based on currency
function updateHeroStats() {
    const rmseStat = document.querySelector('.stat-number');
    if (rmseStat && rmseStat.textContent.includes('$42K')) {
        if (currentCurrency === 'INR') {
            const inrAmount = convertToINR(42000);
            rmseStat.textContent = `₹${(inrAmount / 1000).toFixed(0)}K`;
        } else {
            rmseStat.textContent = '$42K';
        }
    }
    
    // Update live prediction value if it exists
    const livePrediction = document.querySelector('.live-prediction-price');
    if (livePrediction && currentPrediction > 0) {
        let displayAmount = currentPrediction;
        if (currentCurrency === 'INR') {
            displayAmount = convertToINR(currentPrediction);
        }
        livePrediction.textContent = formatCurrency(displayAmount, currentCurrency);
    }
}

// Form submission
predictionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(predictionForm);
    const data = Object.fromEntries(formData);
    
    // Convert numeric fields
    data.area = parseInt(data.area);
    data.bedrooms = parseInt(data.bedrooms);
    data.bathrooms = parseInt(data.bathrooms);
    data.year_built = parseInt(data.year_built);
    data.lat = parseFloat(data.lat);
    data.lon = parseFloat(data.lon);
    
    // Show loading state
    const submitButton = predictionForm.querySelector('.predict-button');
    submitButton.classList.add('loading');
    
    try {
        // Make prediction request
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Prediction failed');
        }
        
        const result = await response.json();
        
        // Display prediction result
        displayPredictionResult(result.prediction);
        
        // Make analysis request
        const analysisResponse = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (analysisResponse.ok) {
            const analysis = await analysisResponse.json();
            displayAnalysis(analysis);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to get prediction. Please try again.');
    } finally {
        submitButton.classList.remove('loading');
    }
});

// Display prediction result
function displayPredictionResult(price) {
    currentPrediction = price;
    updatePriceDisplay();
    resultCard.style.display = 'block';
    resultCard.classList.add('success-animation');
    
    // Animate confidence bar
    setTimeout(() => {
        confidenceFill.style.width = '95%';
    }, 300);
    
    // Scroll to results
    setTimeout(() => {
        resultCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 500);
}

// Display analysis
function displayAnalysis(analysis) {
    // Convert prices based on current currency
    let pricePerSqFt = analysis.price_per_sqft;
    let confidenceLower = analysis.confidence_range.lower;
    let confidenceUpper = analysis.confidence_range.upper;
    
    if (currentCurrency === 'INR') {
        pricePerSqFt = convertToINR(pricePerSqFt);
        confidenceLower = convertToINR(confidenceLower);
        confidenceUpper = convertToINR(confidenceUpper);
    }
    
    const analysisHTML = `
        <div class="analysis-grid">
            <div class="analysis-item">
                <div class="analysis-label">Price per Sq Ft</div>
                <div class="analysis-value">${formatCurrency(pricePerSqFt, currentCurrency)}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">Property Age</div>
                <div class="analysis-value">${analysis.property_age} years</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">Market Score</div>
                <div class="analysis-value score-${analysis.market_score.toLowerCase()}">${analysis.market_score}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">ROI Potential</div>
                <div class="analysis-value">${analysis.roi_potential}</div>
            </div>
        </div>
        
        <div class="confidence-range">
            <h4>Price Range (95% Confidence)</h4>
            <div class="range-display">
                <div class="range-item">
                    <span class="range-label">Low:</span>
                    <span class="range-value">${formatCurrency(confidenceLower, currentCurrency)}</span>
                </div>
                <div class="range-item">
                    <span class="range-label">High:</span>
                    <span class="range-value">${formatCurrency(confidenceUpper, currentCurrency)}</span>
                </div>
                <div class="range-item">
                    <span class="range-label">Variance:</span>
                    <span class="range-value">±${Math.min(Math.round(((confidenceUpper - confidenceLower) / 2 / currentPrediction) * 100), 20)}%</span>
                </div>
            </div>
        </div>
        
        <div class="market-insights">
            <h4>Market Insights</h4>
            <div class="insights-list">
                <div class="insight-item">
                    <i class="fas fa-crown"></i>
                    <span>Luxury Premium: ${formatMarketInsight(analysis.market_insights.luxury_premium)}</span>
                </div>
                <div class="insight-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Location Premium: ${formatMarketInsight(analysis.market_insights.location_premium)}</span>
                </div>
                <div class="insight-item">
                    <i class="fas fa-clock"></i>
                    <span>Age Discount: ${formatMarketInsight(analysis.market_insights.age_discount)}</span>
                </div>
            </div>
        </div>
    `;
    
    analysisContent.innerHTML = analysisHTML;
    analysisCard.style.display = 'block';
    analysisCard.classList.add('success-animation');
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    
    predictionForm.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Analytics functions
function showMarketTrends() {
    showModal('Market Trends', `
        <div class="trends-content">
            <div class="trend-chart">
                <canvas id="trendChart" width="400" height="200"></canvas>
            </div>
            <div class="trend-insights">
                <h4>Key Insights</h4>
                <ul>
                    <li>Property prices have increased 8.5% in the last 6 months</li>
                    <li>Luxury properties show 12% higher growth</li>
                    <li>Central locations maintain premium pricing</li>
                    <li>New construction commands 15% premium</li>
                </ul>
            </div>
        </div>
    `);
}

function showLocationInsights() {
    showModal('Location Insights', `
        <div class="location-content">
            <div class="amenities-grid">
                <div class="amenity-item">
                    <i class="fas fa-subway"></i>
                    <span>Metro Station</span>
                    <span class="distance">0.8 km</span>
                </div>
                <div class="amenity-item">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Shopping Mall</span>
                    <span class="distance">1.2 km</span>
                </div>
                <div class="amenity-item">
                    <i class="fas fa-hospital"></i>
                    <span>Hospital</span>
                    <span class="distance">2.1 km</span>
                </div>
                <div class="amenity-item">
                    <i class="fas fa-school"></i>
                    <span>School</span>
                    <span class="distance">0.5 km</span>
                </div>
                <div class="amenity-item">
                    <i class="fas fa-tree"></i>
                    <span>Park</span>
                    <span class="distance">0.3 km</span>
                </div>
                <div class="amenity-item">
                    <i class="fas fa-plane"></i>
                    <span>Airport</span>
                    <span class="distance">25 min</span>
                </div>
            </div>
        </div>
    `);
}

function showROICalculator() {
    showModal('ROI Calculator', `
        <div class="roi-content">
            <div class="roi-inputs">
                <div class="input-group">
                    <label>Purchase Price</label>
                    <input type="number" id="purchasePrice" value="125375" placeholder="Enter purchase price">
                </div>
                <div class="input-group">
                    <label>Monthly Rent</label>
                    <input type="number" id="monthlyRent" value="1200" placeholder="Expected monthly rent">
                </div>
                <div class="input-group">
                    <label>Annual Expenses (%)</label>
                    <input type="number" id="expenses" value="25" placeholder="Maintenance, taxes, etc.">
                </div>
            </div>
            <button onclick="calculateROI()" class="calculate-btn">Calculate ROI</button>
            <div id="roiResults" class="roi-results" style="display: none;">
                <div class="roi-metric">
                    <span class="metric-label">Annual ROI</span>
                    <span class="metric-value" id="annualROI">0%</span>
                </div>
                <div class="roi-metric">
                    <span class="metric-label">Monthly Cash Flow</span>
                    <span class="metric-value" id="cashFlow">$0</span>
                </div>
                <div class="roi-metric">
                    <span class="metric-label">Break-even Time</span>
                    <span class="metric-value" id="breakEven">0 years</span>
                </div>
            </div>
        </div>
    `);
}

function showPropertyComparison() {
    showModal('Property Comparison', `
        <div class="comparison-content">
            <div class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Price</th>
                            <th>Area</th>
                            <th>Bedrooms</th>
                            <th>Age</th>
                            <th>Price/Sq Ft</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="highlight">
                            <td>Your Property</td>
                            <td>$125,375</td>
                            <td>1,200 sq ft</td>
                            <td>3</td>
                            <td>10 years</td>
                            <td>$104.48</td>
                        </tr>
                        <tr>
                            <td>Similar 1</td>
                            <td>$118,500</td>
                            <td>1,150 sq ft</td>
                            <td>3</td>
                            <td>8 years</td>
                            <td>$103.04</td>
                        </tr>
                        <tr>
                            <td>Similar 2</td>
                            <td>$132,200</td>
                            <td>1,250 sq ft</td>
                            <td>3</td>
                            <td>12 years</td>
                            <td>$105.76</td>
                        </tr>
                        <tr>
                            <td>Similar 3</td>
                            <td>$121,800</td>
                            <td>1,180 sq ft</td>
                            <td>3</td>
                            <td>9 years</td>
                            <td>$103.22</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="comparison-insights">
                <h4>Comparison Insights</h4>
                <ul>
                    <li>Your property is competitively priced</li>
                    <li>Price per sq ft is within market range</li>
                    <li>Age factor is well-balanced</li>
                    <li>Good value for the location</li>
                </ul>
            </div>
        </div>
    `);
}

// ROI Calculation
function calculateROI() {
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
    const expensesPercent = parseFloat(document.getElementById('expenses').value) || 0;
    
    if (purchasePrice === 0 || monthlyRent === 0) {
        alert('Please enter valid values for purchase price and monthly rent');
        return;
    }
    
    const annualRent = monthlyRent * 12;
    const annualExpenses = annualRent * (expensesPercent / 100);
    const netAnnualIncome = annualRent - annualExpenses;
    const annualROI = (netAnnualIncome / purchasePrice) * 100;
    const monthlyCashFlow = netAnnualIncome / 12;
    const breakEvenYears = purchasePrice / netAnnualIncome;
    
    document.getElementById('annualROI').textContent = `${annualROI.toFixed(2)}%`;
    document.getElementById('cashFlow').textContent = `$${monthlyCashFlow.toFixed(2)}`;
    document.getElementById('breakEven').textContent = `${breakEvenYears.toFixed(1)} years`;
    document.getElementById('roiResults').style.display = 'block';
}

// Modal functionality
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Add CSS for modal and additional styles
const additionalStyles = `
    <style>
        .error-message {
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
        }
        
        .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .analysis-item {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .analysis-label {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 0.5rem;
        }
        
        .analysis-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        
        .score-a+ {
            color: #4ecdc4;
        }
        
        .score-b+ {
            color: #ffa726;
        }
        
        .confidence-range {
            margin-bottom: 2rem;
        }
        
        .confidence-range h4 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .range-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .range-low {
            color: #ff6b6b;
        }
        
        .range-high {
            color: #4ecdc4;
        }
        
        .range-separator {
            color: #666;
        }
        
        .market-insights h4 {
            margin-bottom: 1rem;
            color: #333;
        }
        
        .insights-list {
            list-style: none;
        }
        
        .insight-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .insight-item i {
            color: #667eea;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease-out;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #333;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: #f0f0f0;
            color: #333;
        }
        
        .modal-body {
            padding: 2rem;
        }
        
        .trends-content,
        .location-content,
        .roi-content,
        .comparison-content {
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .amenities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .amenity-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .amenity-item i {
            color: #667eea;
            font-size: 1.2rem;
        }
        
        .distance {
            margin-left: auto;
            font-weight: 600;
            color: #4ecdc4;
        }
        
        .roi-inputs {
            display: grid;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .input-group {
            display: flex;
            flex-direction: column;
        }
        
        .input-group label {
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }
        
        .input-group input {
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
        }
        
        .input-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .calculate-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-bottom: 2rem;
        }
        
        .roi-results {
            display: grid;
            gap: 1rem;
        }
        
        .roi-metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .metric-label {
            font-weight: 600;
            color: #333;
        }
        
        .metric-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: #4ecdc4;
        }
        
        .comparison-table {
            overflow-x: auto;
            margin-bottom: 2rem;
        }
        
        .comparison-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .comparison-table th,
        .comparison-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .comparison-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .comparison-table tr.highlight {
            background: rgba(102, 126, 234, 0.1);
        }
        
        .comparison-insights ul {
            list-style: none;
        }
        
        .comparison-insights li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .comparison-insights li:last-child {
            border-bottom: none;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
`;

// Add the additional styles to the document
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
});
