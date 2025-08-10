/**
 * Animations Module
 * Handles all animations and UI effects
 */

class AnimationsManager {
    constructor() {
        this.animationDuration = 300;
    }

    /**
     * Show loading overlay
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `<div class="loader"></div>`;
        document.body.appendChild(loader);
    }

    /**
     * Hide loading overlay
     */
    hideLoader() {
        setTimeout(() => {
            const loader = document.querySelector('.loading-overlay');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 500);
            }
        }, 1000);
    }

    /**
     * Animate counter elements
     */
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

    /**
     * Animate individual counter
     */
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

    /**
     * Show notification
     */
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

    /**
     * Update real-time data with visual feedback
     */
    async updateRealTimeData() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.opacity = '0.7';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 300);
        });
    }

    /**
     * Add fade-in animation to elements
     */
    fadeIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Add slide-up animation to elements
     */
    slideUp(element, duration = 600) {
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 10);
    }
}

export default AnimationsManager;
