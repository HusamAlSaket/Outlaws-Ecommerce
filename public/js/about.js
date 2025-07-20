// About Page Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    console.log('About page loaded');
    
    // Initialize all animations and interactions
    initScrollAnimations();
    initCounterAnimations();
    initParallaxEffects();
    initInteractiveElements();
    initLoadingAnimations();
});

// SCROLL-BASED ANIMATIONS
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated', 'visible');
                
                // Special handling for timeline items
                if (entry.target.classList.contains('timeline-item')) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-timeline');
                    }, 200);
                }
                
                // Special handling for value cards
                if (entry.target.classList.contains('value-card')) {
                    setTimeout(() => {
                        entry.target.classList.add('scale-in');
                    }, 300);
                }
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-left, .animate-right, .fade-in-up, .slide-in-left, .slide-in-right, .timeline-item, .value-card, .content-card');
    animatedElements.forEach(el => observer.observe(el));
}

// COUNTER ANIMATIONS
function initCounterAnimations() {
    const counters = document.querySelectorAll('.hero-stat h3');
    const countSpeed = 200; // The lower the number, the faster the count

    const observerOptions = {
        threshold: 0.7
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const counter = entry.target;
                const target = parseInt(counter.textContent.replace(/\D/g, ''));
                const increment = target / countSpeed;
                let current = 0;
                
                counter.classList.add('counted');
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current).toLocaleString();
                        setTimeout(updateCounter, 10);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                };
                
                updateCounter();
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// PARALLAX EFFECTS
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-about');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });

        // Timeline line animation
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            const timelineRect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (timelineRect.top < windowHeight && timelineRect.bottom > 0) {
                const progress = Math.min(1, Math.max(0, (windowHeight - timelineRect.top) / (windowHeight + timeline.offsetHeight)));
                timeline.style.setProperty('--progress', progress);
            }
        }
    });
}

// INTERACTIVE ELEMENTS
function initInteractiveElements() {
    // Content cards hover effects
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            playHoverSound();
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Click animation
        card.addEventListener('click', function() {
            this.classList.add('click-animation');
            setTimeout(() => {
                this.classList.remove('click-animation');
            }, 300);
        });
    });

    // Value cards interactive effects
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotateY(360deg)';
                icon.style.color = '#0066cc';
                icon.style.textShadow = '0 0 20px rgba(0, 31, 63, 0.3)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotateY(0deg)';
                icon.style.color = '#001f3f';
                icon.style.textShadow = 'none';
            }
        });
    });

    // Timeline item interactions
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const date = this.querySelector('.timeline-date');
            if (date) {
                date.style.transform = 'translate(-50%, -50%) scale(1.1)';
                date.style.boxShadow = '0 8px 25px rgba(0, 31, 63, 0.4)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const date = this.querySelector('.timeline-date');
            if (date) {
                date.style.transform = 'translate(-50%, -50%) scale(1)';
                date.style.boxShadow = '0 5px 15px rgba(0, 31, 63, 0.3)';
            }
        });
    });

    // Hero stats interactive
    const heroStats = document.querySelectorAll('.hero-stat');
    heroStats.forEach(stat => {
        stat.addEventListener('mouseenter', function() {
            const h3 = this.querySelector('h3');
            const p = this.querySelector('p');
            
            if (h3) {
                h3.style.transform = 'scale(1.15)';
                h3.style.textShadow = '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(0, 123, 255, 0.4)';
                h3.style.animationPlayState = 'paused';
            }
            
            if (p) {
                p.style.opacity = '1';
                p.style.transform = 'translateY(-2px)';
            }
        });
        
        stat.addEventListener('mouseleave', function() {
            const h3 = this.querySelector('h3');
            const p = this.querySelector('p');
            
            if (h3) {
                h3.style.transform = 'scale(1)';
                h3.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
                h3.style.animationPlayState = 'running';
            }
            
            if (p) {
                p.style.opacity = '0.8';
                p.style.transform = 'translateY(0)';
            }
        });
    });
}

// LOADING ANIMATIONS
function initLoadingAnimations() {
    // Stagger animation for multiple elements
    const staggerElements = document.querySelectorAll('.content-card, .value-card');
    staggerElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        element.classList.add('fade-in-up');
    });

    // Hero title typewriter effect
    const heroTitle = document.querySelector('.hero-about h1');
    if (heroTitle) {
        const titleText = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.opacity = '1';
        
        let charIndex = 0;
        const typeWriter = () => {
            if (charIndex < titleText.length) {
                heroTitle.textContent += titleText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            } else {
                heroTitle.classList.add('typing-complete');
            }
        };
        
        setTimeout(typeWriter, 500);
    }

    // Progressive image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
    });
}

// UTILITY FUNCTIONS
function playHoverSound() {
    // Optional: Add subtle audio feedback
    // You would need to add audio files and implement this feature
    console.log('Hover sound played');
}

// MOUSE TRACKING EFFECTS
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Parallax cursor effect for special elements
    const parallaxElements = document.querySelectorAll('.icon-box, .timeline-date');
    parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (mouseX - centerX) * 0.05;
        const deltaY = (mouseY - centerY) * 0.05;
        
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });
});

// SMOOTH SCROLLING ENHANCEMENT
function smoothScrollTo(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// PERFORMANCE OPTIMIZATION
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Additional scroll handling if needed
    console.log('Debounced scroll event');
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// ACCESSIBILITY ENHANCEMENTS
function initAccessibility() {
    // Keyboard navigation support
    const interactiveElements = document.querySelectorAll('.content-card, .value-card, .timeline-item');
    
    interactiveElements.forEach(element => {
        element.setAttribute('tabindex', '0');
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
        
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #007bff';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = 'none';
        });
    });
}

// Initialize accessibility features
initAccessibility();

// WINDOW RESIZE HANDLER
window.addEventListener('resize', debounce(() => {
    // Recalculate animations and positions on resize
    initParallaxEffects();
}, 250));
