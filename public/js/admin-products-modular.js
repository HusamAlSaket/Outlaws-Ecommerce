/**
 * Admin Products Management JavaScript
 * Handles product interactions, status toggles, and product details
 */

import BaseDashboard from './modules/BaseDashboard.js';
import AnimationsManager from './modules/AnimationsManager.js';
import AuthManager from './modules/AuthManager.js';

class AdminProducts extends BaseDashboard {
    constructor() {
        super();
        
        this.animations = new AnimationsManager();
        this.auth = new AuthManager();
        
        this.init();
    }

    async init() {
        try {
            this.initializeComponents();
            this.setupEventListeners();
            this.animations.animateCounters();
        } catch (error) {
            console.error('Products page initialization error:', error);
        }
    }

    async initializeComponents() {
        this.initializeElements();
        localStorage.setItem('sidebarOpen', 'true');
        
        if (window.innerWidth > 768) {
            this.elements.sidebarOverlay?.classList.remove('active');
        }
        
        this.updateBreadcrumb();
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.textContent = 'Admin / Products';
        }
    }

    confirmLogout(event) {
        this.auth.confirmLogout(event);
    }
}

// Global functions for product management
window.toggleProductStatus = async function(productId, productName, isActive) {
    const action = isActive ? 'deactivate' : 'activate';
    const actionText = isActive ? 'deactivated' : 'activated';
    
    const result = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
        text: `Are you sure you want to ${action} "${productName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${action}`,
        cancelButtonText: 'Cancel',
        confirmButtonColor: isActive ? '#dc3545' : '#28a745',
        customClass: {
            popup: 'admin-swal-popup',
            title: 'admin-swal-title',
            htmlContainer: 'admin-swal-text',
            confirmButton: 'admin-swal-confirm',
            cancelButton: 'admin-swal-cancel'
        }
    });

    if (result.isConfirmed) {
        try {
            // Show loading
            Swal.fire({
                title: `${action.charAt(0).toUpperCase() + action.slice(1)}ing product...`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(`/admin/products/api/${productId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: `Product "${productName}" has been ${actionText}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'admin-swal-popup'
                    }
                }).then(() => {
                    // Reload the page to show updated status
                    window.location.reload();
                });
            } else {
                throw new Error(data.error || 'Failed to update product status');
            }
        } catch (error) {
            console.error('Error toggling product status:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update product status. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'admin-swal-popup'
                }
            });
        }
    }
};

window.viewProductDetails = async function(productId) {
    try {
        // Show loading
        Swal.fire({
            title: 'Loading product details...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`/admin/products/api/${productId}/details`);
        const data = await response.json();

        if (data.success) {
            const product = data.product;
            
            // Handle image path formatting
            let imagePath = product.image;
            if (imagePath) {
                // If it's not an external URL, handle local paths
                if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
                    if (imagePath.startsWith('../public/')) {
                        imagePath = imagePath.replace('../public/', '/');
                    } else if (!imagePath.startsWith('/')) {
                        imagePath = '/' + imagePath;
                    }
                }
            }
            
            Swal.fire({
                title: `Product Details: ${product.title}`,
                html: `
                    <div class="product-details-modal">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="product-image-lg mb-3">
                                    ${imagePath ? 
                                        `<img src="${imagePath}" alt="${product.title}" class="img-fluid" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                         <div class="no-image" style="display: none;"><i class="fas fa-box"></i></div>` :
                                        `<div class="no-image"><i class="fas fa-box"></i></div>`
                                    }
                                </div>
                            </div>
                            <div class="col-md-8">
                                <table class="table table-borderless">
                                    <tr>
                                        <td><strong>Name:</strong></td>
                                        <td>${product.title}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Category:</strong></td>
                                        <td>${product.category || 'Uncategorized'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Price:</strong></td>
                                        <td><span class="price-tag">$${product.price}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Stock:</strong></td>
                                        <td>
                                            <span class="badge bg-${product.quantity <= 5 ? 'danger' : product.quantity <= 20 ? 'warning' : 'success'}">
                                                ${product.quantity} units
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td>
                                            <span class="badge bg-${product.isActive ? 'success' : 'warning'}">
                                                ${product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Created:</strong></td>
                                        <td>${new Date(product.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                </table>
                                ${product.description ? `
                                    <div class="mt-3">
                                        <strong>Description:</strong>
                                        <p class="text-muted mt-2">${product.description}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `,
                width: 700,
                confirmButtonText: 'Close',
                customClass: {
                    popup: 'admin-swal-popup',
                    title: 'admin-swal-title',
                    htmlContainer: 'admin-swal-text',
                    confirmButton: 'admin-swal-confirm'
                }
            });
        } else {
            throw new Error(data.error || 'Failed to fetch product details');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to load product details. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'admin-swal-popup'
            }
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productsPage = new AdminProducts();
});

export default AdminProducts;