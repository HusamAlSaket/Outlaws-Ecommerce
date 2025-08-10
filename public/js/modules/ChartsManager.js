/**
 * Charts Module
 * Handles all chart-related functionality
 */

class ChartsManager {
    constructor() {
        this.charts = {};
    }

    /**
     * Initialize all charts
     */
    async initializeCharts() {
        console.log('📊 ChartsManager: Starting chart initialization...');
        try {
            // Chart.js should already be loaded from HTML
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js is not loaded. Make sure it is included in the HTML.');
            }
            console.log('✅ Chart.js is available');
            
            console.log('🔄 Creating charts...');
            await Promise.all([
                this.createOrdersChart(),
                this.createRevenueChart()
            ]);
            console.log('✅ All charts created successfully');
        } catch (error) {
            console.error('❌ Error loading charts:', error);
            throw error; // Re-throw so main dashboard can handle it
        }
    }

    /**
     * Create orders line chart
     */
    async createOrdersChart() {
        console.log('📊 Creating orders chart...');
        const ctx = document.getElementById('ordersChart');
        if (!ctx) {
            console.error('❌ ordersChart canvas element not found');
            return;
        }

        this.hideLoadingIndicator(ctx);
        
        try {
            console.log('🔄 Fetching orders data...');
            const data = await this.fetchOrdersData();
            console.log('✅ Orders data received:', data);

            this.charts.orders = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Orders',
                        data: data.values,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: this.getLineChartOptions()
            });
            console.log('✅ Orders chart created successfully');
        } catch (error) {
            console.error('❌ Failed to create orders chart:', error);
            throw error;
        }
    }

    /**
     * Create revenue doughnut chart
     */
    async createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.hideLoadingIndicator(ctx);
        const data = await this.fetchRevenueData();

        this.charts.revenue = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 2
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    /**
     * Get line chart options
     */
    getLineChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b' }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#64748b' }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
    }

    /**
     * Get doughnut chart options
     */
    getDoughnutChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                duration: 2000
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: '#64748b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        };
    }

    /**
     * Fetch orders data from API
     */
    async fetchOrdersData() {
        try {
            const response = await fetch('/admin/dashboard/api/orders-chart');
            if (!response.ok) throw new Error('Failed to fetch orders data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders data:', error);
            return { labels: ['No Data'], values: [0] };
        }
    }

    /**
     * Fetch revenue data from API
     */
    async fetchRevenueData() {
        try {
            const response = await fetch('/admin/dashboard/api/revenue-chart');
            if (!response.ok) throw new Error('Failed to fetch revenue data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            return { labels: ['No Data'], values: [0] };
        }
    }

    /**
     * Refresh a specific chart
     */
    async refreshChart(chartType) {
        const chart = this.charts[chartType];
        if (!chart) return;

        try {
            let newData;
            if (chartType === 'orders') {
                newData = await this.fetchOrdersData();
                chart.data.labels = newData.labels;
                chart.data.datasets[0].data = newData.values;
            } else if (chartType === 'revenue') {
                newData = await this.fetchRevenueData();
                chart.data.labels = newData.labels;
                chart.data.datasets[0].data = newData.values;
            }

            chart.update('active');
        } catch (error) {
            console.error('Error refreshing chart:', error);
        }
    }

    /**
     * Hide loading indicator for chart
     */
    hideLoadingIndicator(ctx) {
        const loadingElement = ctx.parentElement.querySelector('.chart-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Resize all charts (for responsive behavior)
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
}

export default ChartsManager;
