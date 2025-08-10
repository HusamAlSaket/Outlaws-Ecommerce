/**
 * Base Dashboard Class
 * Core functionality for admin dashboard
 */

class BaseDashboard {
    constructor() {
        this.animationDuration = 300;
        this.isLoading = true;
        this.elements = {};
    }

    /**
     * Initialize dashboard elements
     */
    initializeElements() {
        this.elements = {
            sidebar: document.getElementById('sidebar'),
            mainContent: document.getElementById('mainContent'),
            menuToggle: document.getElementById('menuToggle'),
            sidebarOverlay: document.getElementById('sidebarOverlay')
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        this.elements.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        this.elements.sidebarOverlay?.addEventListener('click', () => this.toggleSidebar());

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Sidebar menu items
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        this.elements.sidebar?.classList.toggle('active');
        
        // Only use overlay on mobile/tablet
        if (window.innerWidth <= 768) {
            this.elements.sidebarOverlay?.classList.toggle('active');
        }
        
        // Only shift content on desktop
        if (window.innerWidth > 768) {
            this.elements.mainContent?.classList.toggle('shifted');
        }

        // Store sidebar state
        localStorage.setItem('sidebarOpen', this.elements.sidebar?.classList.contains('active'));
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (window.innerWidth > 768) {
            if (this.elements.sidebar?.classList.contains('active')) {
                this.elements.mainContent?.classList.add('shifted');
            }
        } else {
            this.elements.mainContent?.classList.remove('shifted');
        }
    }

    /**
     * Handle menu item clicks
     */
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

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Ctrl/Cmd + B to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
    }

    /**
     * Update breadcrumb navigation
     */
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

    /**
     * Utility method to format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    /**
     * Utility method to format numbers
     */
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }
}

export default BaseDashboard;
