/**
 * Admin Dashboard Main Class
 * Orchestrates all dashboard functionality using modular architecture
 * 
 * Think of this as the "Project Manager" that coordinates different teams:
 * - ChartsManager: Handles all chart creation and data
 * - AnimationsManager: Handles all animations and UI effects  
 * - AuthManager: Handles authentication (logout, etc.)
 * - BaseDashboard: Common functionality (sidebar, menus, etc.)
 */

import BaseDashboard from './modules/BaseDashboard.js';
import ChartsManager from './modules/ChartsManager.js';
import AnimationsManager from './modules/AnimationsManager.js';
import AuthManager from './modules/AuthManager.js';

class AdminDashboard extends BaseDashboard {
    constructor() {
        super(); // Get common functionality from BaseDashboard
        
        console.log('🏗️ AdminDashboard: Creating dashboard modules...');
        // Create our specialized toolboxes
        this.charts = new ChartsManager();           // 📊 Charts toolbox
        this.animations = new AnimationsManager();   // ✨ Animations toolbox
        this.auth = new AuthManager();               // 🔐 Auth toolbox
        console.log('✅ AdminDashboard: All modules created successfully!');
        
        this.init();
    }

    /**
     * Initialize dashboard
     * This is like the "Project Manager" giving instructions to each team
     */
    async init() {
        try {
            // 🔄 Show loading screen (AnimationsManager handles this)
            this.animations.showLoader();
            
            // 🏗️ Set up basic dashboard structure (BaseDashboard handles this)
            await this.initializeComponents();
            
            // 👂 Set up all click handlers and events (BaseDashboard + this class)
            this.setupEventListeners();
            
            // ✨ Make the stat numbers count up nicely (AnimationsManager handles this)
            this.animations.animateCounters();
            
            // 📊 Create all the charts (ChartsManager handles this)
            console.log('🔄 AdminDashboard: Initializing charts...');
            await this.charts.initializeCharts();
            console.log('✅ AdminDashboard: Charts initialized successfully');
            
            // ✅ Hide loading screen (AnimationsManager handles this)
            this.animations.hideLoader();
            
            // 🔄 Start updating data automatically
            this.startRealTimeUpdates();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            // 🚨 Show error message (AnimationsManager handles this)
            this.animations.showNotification('Failed to initialize dashboard', 'error');
        }
    }

    /**
     * Initialize components
     * Uses BaseDashboard for common setup, adds dashboard-specific setup
     */
    async initializeComponents() {
        // 🏗️ Initialize base elements (sidebar, menu, etc.) - BaseDashboard handles this
        this.initializeElements();
        
        // 📱 Set sidebar open by default on desktop
        localStorage.setItem('sidebarOpen', 'true');
        
        // 💻 Desktop: sidebar open without overlay, Mobile: sidebar closed
        if (window.innerWidth > 768) {
            this.elements.sidebarOverlay?.classList.remove('active');
        }
        
        // 🍞 Update breadcrumb navigation
        this.updateBreadcrumb();
    }

    /**
     * Setup event listeners (extended from base)
     */
    setupEventListeners() {
        // Call parent method
        super.setupEventListeners();
        
        // Add scroll handlers for animations
        this.setupScrollAnimations();
    }

    /**
     * Handle window resize (extended from base)
     */
    handleResize() {
        // Call parent method
        super.handleResize();
        
        // Resize charts
        this.charts.resizeCharts();
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animations.fadeIn(entry.target);
                }
            });
        }, observerOptions);

        // Observe dashboard cards
        document.querySelectorAll('.content-card').forEach(card => {
            observer.observe(card);
        });
    }

    /**
     * Refresh chart data
     * When user clicks the refresh button on a chart
     */
    async refreshChart(chartType) {
        const button = event.target.closest('.btn-icon');
        const icon = button.querySelector('i');
        
        // 🔄 Show spinning icon to indicate loading
        icon.classList.remove('fa-refresh');
        icon.classList.add('fa-spinner', 'fa-spin');

        try {
            // 📊 Tell ChartsManager to refresh the specific chart
            await this.charts.refreshChart(chartType);
            
            // ✅ Show success message (AnimationsManager handles this)
            this.animations.showNotification(`${chartType} chart refreshed successfully`, 'success');
        } catch (error) {
            console.error('Error refreshing chart:', error);
            
            // ❌ Show error message (AnimationsManager handles this)
            this.animations.showNotification('Failed to refresh chart', 'error');
        } finally {
            // 🔄 Reset button back to normal refresh icon
            setTimeout(() => {
                icon.classList.remove('fa-spinner', 'fa-spin');
                icon.classList.add('fa-refresh');
            }, 1000);
        }
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update dashboard data every 30 seconds
        setInterval(() => {
            this.animations.updateRealTimeData();
        }, 30000);
    }

    /**
     * Logout confirmation
     * When user clicks logout, delegate to AuthManager
     */
    confirmLogout(event) {
        // 🔐 Tell AuthManager to handle logout confirmation with SweetAlert
        this.auth.confirmLogout(event);
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        try {
            const response = await fetch('/admin/api/dashboard-stats');
            if (!response.ok) throw new Error('Failed to fetch dashboard stats');
            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            this.animations.showNotification('Failed to fetch dashboard stats', 'error');
            return null;
        }
    }

    /**
     * Export dashboard data (future feature)
     */
    async exportDashboardData(format = 'csv') {
        try {
            const response = await fetch(`/admin/api/export-dashboard?format=${format}`);
            if (!response.ok) throw new Error('Failed to export data');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-data.${format}`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.animations.showNotification('Dashboard data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting dashboard data:', error);
            this.animations.showNotification('Failed to export dashboard data', 'error');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});

// Export for module systems
export default AdminDashboard;
