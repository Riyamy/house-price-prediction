// Advanced Analytics Functions
class PropertyAnalytics {
    constructor() {
        this.chartInstances = {};
        this.marketData = null;
    }

    // Initialize analytics
    async init() {
        await this.loadMarketData();
        this.setupEventListeners();
    }

    // Load market data from API
    async loadMarketData() {
        try {
            const response = await fetch('/api/market-data');
            if (response.ok) {
                this.marketData = await response.json();
            }
        } catch (error) {
            console.error('Failed to load market data:', error);
        }
    }

    // Setup event listeners for analytics features
    setupEventListeners() {
        // Add event listeners for analytics buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-analytics="trends"]')) {
                this.showMarketTrends();
            } else if (e.target.matches('[data-analytics="location"]')) {
                this.showLocationInsights();
            } else if (e.target.matches('[data-analytics="roi"]')) {
                this.showROICalculator();
            } else if (e.target.matches('[data-analytics="comparison"]')) {
                this.showPropertyComparison();
            }
        });
    }

    // Show market trends with interactive chart
    showMarketTrends() {
        const content = `
            <div class="trends-content">
                <div class="trend-chart">
                    <canvas id="trendChart" width="400" height="200"></canvas>
                </div>
                <div class="trend-insights">
                    <h4>Key Insights</h4>
                    <div class="insight-grid">
                        <div class="insight-card">
                            <div class="insight-icon">📈</div>
                            <div class="insight-text">
                                <strong>8.5%</strong> price growth in 6 months
                            </div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">🏆</div>
                            <div class="insight-text">
                                <strong>12%</strong> luxury property growth
                            </div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">📍</div>
                            <div class="insight-text">
                                <strong>15%</strong> central location premium
                            </div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">🏗️</div>
                            <div class="insight-text">
                                <strong>15%</strong> new construction premium
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Market Trends', content);
        this.renderTrendChart();
    }

    // Render trend chart
    renderTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Price Index',
                data: [100, 102, 105, 104, 107, 108.5],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };

        // Simple chart rendering (you can replace with Chart.js for better charts)
        this.drawSimpleChart(ctx, data);
    }

    // Draw simple chart
    drawSimpleChart(ctx, data) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.strokeStyle = '#e1e5e9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw data line
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const maxValue = Math.max(...data.datasets[0].data);
        const minValue = Math.min(...data.datasets[0].data);
        const valueRange = maxValue - minValue;

        data.datasets[0].data.forEach((value, index) => {
            const x = padding + (index / (data.labels.length - 1)) * chartWidth;
            const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#667eea';
        data.datasets[0].data.forEach((value, index) => {
            const x = padding + (index / (data.labels.length - 1)) * chartWidth;
            const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        data.labels.forEach((label, index) => {
            const x = padding + (index / (data.labels.length - 1)) * chartWidth;
            ctx.fillText(label, x, height - padding + 20);
        });
    }

    // Show location insights
    showLocationInsights() {
        const content = `
            <div class="location-content">
                <div class="amenities-grid">
                    <div class="amenity-item">
                        <i class="fas fa-subway"></i>
                        <div class="amenity-info">
                            <span class="amenity-name">Metro Station</span>
                            <span class="amenity-distance">0.8 km</span>
                        </div>
                        <div class="amenity-impact">+$15k</div>
                    </div>
                    <div class="amenity-item">
                        <i class="fas fa-shopping-cart"></i>
                        <div class="amenity-info">
                            <span class="amenity-name">Shopping Mall</span>
                            <span class="amenity-distance">1.2 km</span>
                        </div>
                        <div class="amenity-impact">+$8k</div>
                    </div>
                    <div class="amenity-item">
                        <i class="fas fa-hospital"></i>
                        <div class="amenity-info">
                            <span class="amenity-name">Hospital</span>
                            <span class="amenity-distance">2.1 km</span>
                        </div>
                        <div class="amenity-impact">+$5k</div>
                    </div>
                    <div class="amenity-item">
                        <i class="fas fa-school"></i>
                        <div class="amenity-info">
                            <span class="amenity-name">School</span>
                            <span class="amenity-distance">0.5 km</span>
                        </div>
                        <div class="amenity-impact">+$12k</div>
                    </div>
                    <div class="amenity-item">
                        <i class="fas fa-tree"></i>
                        <div class="amenity-info">
                            <span class="amenity-name">Park</span>
                            <span class="amenity-distance">0.3 km</span>
                        </div>
                        <div class="amenity-impact">+$10k</div>
                    </div>
                    <div class="amenity-item">
                        <i class="fas fa-plane"></i>
                        <div class="amenity-info">
                            <span class="amenity-name">Airport</span>
                            <span class="amenity-distance">25 min</span>
                        </div>
                        <div class="amenity-impact">+$20k</div>
                    </div>
                </div>
                
                <div class="transportation-section">
                    <h4>Transportation Access</h4>
                    <div class="transport-grid">
                        <div class="transport-item">
                            <i class="fas fa-subway"></i>
                            <span>Metro: 5 min walk</span>
                        </div>
                        <div class="transport-item">
                            <i class="fas fa-bus"></i>
                            <span>Bus Stop: 2 min walk</span>
                        </div>
                        <div class="transport-item">
                            <i class="fas fa-road"></i>
                            <span>Highway: 8 min drive</span>
                        </div>
                        <div class="transport-item">
                            <i class="fas fa-plane"></i>
                            <span>Airport: 25 min drive</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Location Insights', content);
    }

    // Show ROI calculator
    showROICalculator() {
        const content = `
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
                    <div class="input-group">
                        <label>Down Payment (%)</label>
                        <input type="number" id="downPayment" value="20" placeholder="Down payment percentage">
                    </div>
                </div>
                <button onclick="analytics.calculateROI()" class="calculate-btn">Calculate ROI</button>
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
                    <div class="roi-metric">
                        <span class="metric-label">Cash-on-Cash Return</span>
                        <span class="metric-value" id="cashOnCash">0%</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('ROI Calculator', content);
    }

    // Enhanced ROI calculation
    calculateROI() {
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
        const expensesPercent = parseFloat(document.getElementById('expenses').value) || 0;
        const downPaymentPercent = parseFloat(document.getElementById('downPayment').value) || 20;
        
        if (purchasePrice === 0 || monthlyRent === 0) {
            alert('Please enter valid values for purchase price and monthly rent');
            return;
        }
        
        const downPayment = purchasePrice * (downPaymentPercent / 100);
        const loanAmount = purchasePrice - downPayment;
        const annualRent = monthlyRent * 12;
        const annualExpenses = annualRent * (expensesPercent / 100);
        const netAnnualIncome = annualRent - annualExpenses;
        
        // Calculate ROI based on total investment
        const totalROI = (netAnnualIncome / purchasePrice) * 100;
        
        // Calculate cash-on-cash return (based on down payment only)
        const cashOnCashReturn = (netAnnualIncome / downPayment) * 100;
        
        const monthlyCashFlow = netAnnualIncome / 12;
        const breakEvenYears = purchasePrice / netAnnualIncome;
        
        document.getElementById('annualROI').textContent = `${totalROI.toFixed(2)}%`;
        document.getElementById('cashFlow').textContent = `$${monthlyCashFlow.toFixed(2)}`;
        document.getElementById('breakEven').textContent = `${breakEvenYears.toFixed(1)} years`;
        document.getElementById('cashOnCash').textContent = `${cashOnCashReturn.toFixed(2)}%`;
        document.getElementById('roiResults').style.display = 'block';
    }

    // Show property comparison
    showPropertyComparison() {
        const content = `
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
                                <th>Score</th>
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
                                <td><span class="score-badge score-a">A+</span></td>
                            </tr>
                            <tr>
                                <td>Similar 1</td>
                                <td>$118,500</td>
                                <td>1,150 sq ft</td>
                                <td>3</td>
                                <td>8 years</td>
                                <td>$103.04</td>
                                <td><span class="score-badge score-b">B+</span></td>
                            </tr>
                            <tr>
                                <td>Similar 2</td>
                                <td>$132,200</td>
                                <td>1,250 sq ft</td>
                                <td>3</td>
                                <td>12 years</td>
                                <td>$105.76</td>
                                <td><span class="score-badge score-a">A</span></td>
                            </tr>
                            <tr>
                                <td>Similar 3</td>
                                <td>$121,800</td>
                                <td>1,180 sq ft</td>
                                <td>3</td>
                                <td>9 years</td>
                                <td>$103.22</td>
                                <td><span class="score-badge score-b">B+</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="comparison-insights">
                    <h4>Comparison Insights</h4>
                    <div class="insight-list">
                        <div class="insight-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Your property is competitively priced</span>
                        </div>
                        <div class="insight-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Price per sq ft is within market range</span>
                        </div>
                        <div class="insight-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Age factor is well-balanced</span>
                        </div>
                        <div class="insight-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Good value for the location</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Property Comparison', content);
    }

    // Show modal
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="analytics.closeModal()">
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
                this.closeModal();
            }
        });
    }

    // Close modal
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }
}

// Initialize analytics
const analytics = new PropertyAnalytics();
document.addEventListener('DOMContentLoaded', () => {
    analytics.init();
});
