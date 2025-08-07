/**
 * Admin Dashboard JavaScript
 * Professional dashboard with animations, charts, and interactions
 */

class AdminDashboard {
    constructor() {
        this.charts = {};
        this.animationDuration = 300;
        this.isLoading = true;
        
        this.init();
    }

    async init() {
        this.showLoader();
        await this.initializeComponents();
        this.setupEventListeners();
        this.animateCounters();
        await this.loadCharts();
        this.hideLoader();
        this.startRealTimeUpdates();
    }

    showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loader"></div>
        `;
        document.body.appendChild(loader);
    }

    hideLoader() {
        setTimeout(() => {
            const loader = document.querySelector('.loading-overlay');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 500);
            }
        }, 1000);
    }

    async initializeComponents() {
        // Initialize sidebar
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('mainContent');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        
        // Set sidebar open by default (overrides any localStorage)
        localStorage.setItem('sidebarOpen', 'true');
        
        // Ensure overlay is NOT active when sidebar is open by default on desktop
        if (window.innerWidth > 768) {
            this.sidebarOverlay?.classList.remove('active');
        }
        
        // Add breadcrumb functionality
        this.updateBreadcrumb();
    }

    setupEventListeners() {
        // Sidebar toggle
        this.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay?.addEventListener('click', () => this.toggleSidebar());

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Sidebar menu items
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // Add smooth scrolling to any anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    toggleSidebar() {
        this.sidebar?.classList.toggle('active');
        
        // Only use overlay on mobile/tablet
        if (window.innerWidth <= 768) {
            this.sidebarOverlay?.classList.toggle('active');
        }
        
        // Only shift content on desktop
        if (window.innerWidth > 768) {
            this.mainContent?.classList.toggle('shifted');
        }

        // Store sidebar state
        localStorage.setItem('sidebarOpen', this.sidebar?.classList.contains('active'));
    }

    handleResize() {
        if (window.innerWidth > 768) {
            if (this.sidebar?.classList.contains('active')) {
                this.mainContent?.classList.add('shifted');
            }
        } else {
            this.mainContent?.classList.remove('shifted');
        }

        // Resize charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    handleMenuClick(e) {
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }

        // Update active state
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
    }

    handleAnchorClick(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + B to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            const path = window.location.pathname;
            const segments = path.split('/').filter(Boolean);
            
            if (segments.includes('admin')) {
                breadcrumb.textContent = 'Admin / Dashboard';
            }
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            // Format number based on original content
            const originalText = element.textContent;
            if (originalText.includes('$')) {
                element.textContent = '$' + Math.floor(current).toFixed(2);
            } else {
                element.textContent = Math.floor(current).toString();
            }
        }, 16);
    }

    async loadCharts() {
        try {
            // Load Chart.js if not already loaded
            if (typeof Chart === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
            }

            await Promise.all([
                this.createOrdersChart(),
                this.createRevenueChart()
            ]);
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    async createOrdersChart() {
        const ctx = document.getElementById('ordersChart');
        if (!ctx) return;

        // Hide loading indicator
        const loadingElement = ctx.parentElement.querySelector('.chart-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // Simulate data - replace with actual API call
        const data = await this.fetchOrdersData();

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
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
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
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    async createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        // Hide loading indicator
        const loadingElement = ctx.parentElement.querySelector('.chart-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

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
            options: {
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
            }
        });
    }

    async fetchOrdersData() {
        try {
            const response = await fetch('/admin/api/orders-chart');
            if (!response.ok) {
                throw new Error('Failed to fetch orders data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders data:', error);
            // Fallback to sample data if API fails
            return {
                labels: ['No Data'],
                values: [0]
            };
        }
    }

    async fetchRevenueData() {
        try {
            const response = await fetch('/admin/api/revenue-chart');
            if (!response.ok) {
                throw new Error('Failed to fetch revenue data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            // Fallback to sample data if API fails
            return {
                labels: ['No Data'],
                values: [0]
            };
        }
    }

    async refreshChart(chartType) {
        const chart = this.charts[chartType];
        if (!chart) return;

        // Add loading state
        const button = event.target.closest('.btn-icon');
        const icon = button.querySelector('i');
        icon.classList.remove('fa-refresh');
        icon.classList.add('fa-spinner', 'fa-spin');

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
        } finally {
            // Reset button state
            setTimeout(() => {
                icon.classList.remove('fa-spinner', 'fa-spin');
                icon.classList.add('fa-refresh');
            }, 1000);
        }
    }

    startRealTimeUpdates() {
        // Update dashboard data every 30 seconds
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
    }

    async updateRealTimeData() {
        // Simulate real-time updates
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.opacity = '0.7';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 300);
        });
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Utility method to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Utility method to format numbers
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    // Method to show notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Logout confirmation with SweetAlert
    confirmLogout(event) {
        event.preventDefault();
        
        Swal.fire({
            title: 'Logout Confirmation',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                popup: 'admin-swal-popup',
                title: 'admin-swal-title',
                htmlContainer: 'admin-swal-text',
                confirmButton: 'admin-swal-confirm',
                cancelButton: 'admin-swal-cancel',
                icon: 'admin-swal-icon'
            },
            buttonsStyling: false,
            backdrop: `
                rgba(30, 58, 138, 0.4)
                left top
                no-repeat
            `
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Logging out...',
                    text: 'Please wait while we log you out',
                    icon: 'info',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'admin-swal-popup',
                        title: 'admin-swal-title',
                        htmlContainer: 'admin-swal-text',
                        icon: 'admin-swal-icon'
                    },
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Redirect to logout after short delay
                setTimeout(() => {
                    window.location.href = '/logout';
                }, 1000);
            }
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
