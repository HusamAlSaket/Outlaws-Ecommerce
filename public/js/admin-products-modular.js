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
            this.setupGlobalFunctions();
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

    setupGlobalFunctions() {
        // Make product management functions available globally
        window.toggleProductStatus = this.toggleProductStatus.bind(this);
        window.viewProductDetails = this.viewProductDetails.bind(this);
        window.editProduct = this.editProduct.bind(this);
        window.deleteProduct = this.deleteProduct.bind(this);
        window.addNewProduct = this.addNewProduct.bind(this);
    }

    async toggleProductStatus(productId, productName, newStatus) {
        const action = newStatus ? 'activate' : 'deactivate';
        const actionText = newStatus ? 'activated' : 'deactivated';
        
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
            text: `Are you sure you want to ${action} "${productName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${action}`,
            cancelButtonText: 'Cancel',
            confirmButtonColor: newStatus ? '#28a745' : '#dc3545',
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
                // Revert the toggle switch
                const toggleSwitch = document.getElementById(`toggle${productId}`);
                if (toggleSwitch) {
                    toggleSwitch.checked = !newStatus;
                }
                
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
        } else {
            // User cancelled, revert the toggle switch
            const toggleSwitch = document.getElementById(`toggle${productId}`);
            if (toggleSwitch) {
                toggleSwitch.checked = !newStatus;
            }
        }
    }

    async viewProductDetails(productId) {
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
                    title: `${product.title}`,
                    html: `
                        <div class="product-details-improved">
                            <div class="text-center mb-3">
                                <div class="product-img-medium">
                                    ${imagePath ? 
                                        `<img src="${imagePath}" alt="${product.title}" class="product-image-med" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                         <div class="no-image-med" style="display: none;"><i class="fas fa-box"></i></div>` :
                                        `<div class="no-image-med"><i class="fas fa-box"></i></div>`
                                    }
                                </div>
                            </div>
                            <div class="product-info-grid">
                                <div class="info-item">
                                    <span class="info-label">Category:</span>
                                    <span class="info-value">${product.category || 'Uncategorized'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Price:</span>
                                    <span class="info-value price-highlight">$${product.price}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Stock:</span>
                                    <span class="badge bg-${product.quantity <= 5 ? 'danger' : product.quantity <= 20 ? 'warning' : 'success'}">${product.quantity} units</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Status:</span>
                                    <span class="badge bg-${product.isActive ? 'success' : 'secondary'}">${product.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Created:</span>
                                    <span class="info-value">${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                ${product.description ? `
                                <div class="info-item full-width">
                                    <span class="info-label">Description:</span>
                                    <span class="info-value text-muted">${product.description}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <style>
                            .product-details-improved {
                                text-align: left;
                                padding: 0.75rem;
                            }
                            .product-img-medium {
                                display: inline-block;
                                margin-bottom: 1rem;
                            }
                            .product-image-med {
                                width: 150px;
                                height: 150px;
                                object-fit: cover;
                                border-radius: 12px;
                                border: 2px solid #e2e8f0;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                display: block;
                                margin: 0 auto;
                            }
                            .no-image-med {
                                width: 150px;
                                height: 150px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: #f8f9fa;
                                border-radius: 12px;
                                border: 2px solid #e2e8f0;
                                color: #6b7280;
                                font-size: 2rem;
                                margin: 0 auto;
                            }
                            .product-info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 0.5rem;
                                margin-top: 0.75rem;
                            }
                            .info-item {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 0.5rem 0.75rem;
                                background: #f8fafc;
                                border-radius: 8px;
                                border: 1px solid #e2e8f0;
                                margin: 0;
                            }
                            .info-item.full-width {
                                grid-column: 1 / -1;
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 0.4rem;
                            }
                            .info-label {
                                font-weight: 600;
                                color: #374151;
                                font-size: 0.9rem;
                                margin: 0;
                            }
                            .info-value {
                                color: #6b7280;
                                font-size: 0.9rem;
                                margin: 0;
                            }
                            .price-highlight {
                                color: #059669 !important;
                                font-weight: 700 !important;
                                font-size: 1.1rem !important;
                            }
                        </style>
                    `,
                    width: '550px',
                    showConfirmButton: true,
                    confirmButtonText: 'Close',
                    confirmButtonColor: '#1e40af',
                    customClass: {
                        popup: 'admin-swal-popup-compact',
                        title: 'admin-swal-title-compact',
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
    }

    addNewProduct() {
        Swal.fire({
            title: 'Add New Product',
            html: `
                <form id="addProductForm" class="compact-form">
                    <div class="row g-2">
                        <div class="col-12">
                            <label for="productTitle" class="form-label">Product Name *</label>
                            <input type="text" class="form-control form-control-sm" id="productTitle" required>
                        </div>
                        <div class="col-6">
                            <label for="productPrice" class="form-label">Price *</label>
                            <input type="number" class="form-control form-control-sm" id="productPrice" step="1" required>
                        </div>
                        <div class="col-6">
                            <label for="productQuantity" class="form-label">Stock *</label>
                            <input type="number" class="form-control form-control-sm" id="productQuantity" required>
                        </div>
                        <div class="col-12">
                            <label for="productCategory" class="form-label">Category</label>
                            <input type="text" class="form-control form-control-sm" id="productCategory">
                        </div>
                        <div class="col-12">
                            <label for="productImage" class="form-label">Image URL</label>
                            <input type="url" class="form-control form-control-sm" id="productImage" placeholder="https://example.com/image.jpg">
                        </div>
                        <div class="col-12">
                            <label for="productDescription" class="form-label">Description</label>
                            <textarea class="form-control form-control-sm" id="productDescription" rows="2"></textarea>
                        </div>
                        <div class="col-12">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="productActive" checked>
                                <label class="form-check-label" for="productActive">Active Product</label>
                            </div>
                        </div>
                    </div>
                </form>
                <style>
                    .compact-form .form-label {
                        font-weight: 600;
                        color: #1e293b;
                        margin-bottom: 0.3rem;
                        font-size: 0.9rem;
                    }
                    .compact-form .form-control-sm {
                        border-color: #cbd5e1;
                        border-radius: 6px;
                    }
                    .compact-form .form-control-sm:focus {
                        border-color: #1e40af;
                        box-shadow: 0 0 0 0.1rem rgba(30, 64, 175, 0.25);
                    }
                </style>
            `,
            width: '450px',
            showCancelButton: true,
            confirmButtonText: 'Create Product',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#1e40af',
            cancelButtonColor: '#64748b',
            customClass: {
                popup: 'admin-swal-popup',
                title: 'admin-swal-title',
                confirmButton: 'admin-swal-confirm',
                cancelButton: 'admin-swal-cancel'
            },
            preConfirm: () => {
                const title = document.getElementById('productTitle').value;
                const price = document.getElementById('productPrice').value;
                const quantity = document.getElementById('productQuantity').value;
                
                if (!title || !price || !quantity) {
                    Swal.showValidationMessage('Please fill in all required fields');
                    return false;
                }
                
                return {
                    title: title,
                    description: document.getElementById('productDescription').value,
                    price: parseFloat(price),
                    quantity: parseInt(quantity),
                    category: document.getElementById('productCategory').value,
                    image: document.getElementById('productImage').value,
                    isActive: document.getElementById('productActive').checked
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Show loading
                    Swal.fire({
                        title: 'Creating product...',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    const response = await fetch('/admin/products/api/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(result.value)
                    });

                    const data = await response.json();

                    if (data.success) {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Product created successfully',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        throw new Error(data.error || 'Failed to create product');
                    }
                } catch (error) {
                    console.error('Error creating product:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to create product. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    }

    async editProduct(productId) {
        try {
            // First fetch the product details
            const response = await fetch(`/admin/products/api/${productId}/details`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch product details');
            }

            const product = data.product;

            Swal.fire({
                title: 'Edit Product',
                html: `
                    <form id="editProductForm" class="compact-form">
                        <div class="row g-2">
                            <div class="col-12">
                                <label for="editProductTitle" class="form-label">Product Name *</label>
                                <input type="text" class="form-control form-control-sm" id="editProductTitle" value="${product.title}" required>
                            </div>
                            <div class="col-6">
                                <label for="editProductPrice" class="form-label">Price *</label>
                                <input type="number" class="form-control form-control-sm" id="editProductPrice" step="1" value="${product.price}" required>
                            </div>
                            <div class="col-6">
                                <label for="editProductQuantity" class="form-label">Stock *</label>
                                <input type="number" class="form-control form-control-sm" id="editProductQuantity" value="${product.quantity}" required>
                            </div>
                            <div class="col-12">
                                <label for="editProductCategory" class="form-label">Category</label>
                                <input type="text" class="form-control form-control-sm" id="editProductCategory" value="${product.category || ''}">
                            </div>
                            <div class="col-12">
                                <label for="editProductImage" class="form-label">Image URL</label>
                                <input type="url" class="form-control form-control-sm" id="editProductImage" value="${product.image || ''}" placeholder="https://example.com/image.jpg">
                            </div>
                            <div class="col-12">
                                <label for="editProductDescription" class="form-label">Description</label>
                                <textarea class="form-control form-control-sm" id="editProductDescription" rows="2">${product.description || ''}</textarea>
                            </div>
                            <div class="col-12">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="editProductActive" ${product.isActive ? 'checked' : ''}>
                                    <label class="form-check-label" for="editProductActive">Active Product</label>
                                </div>
                            </div>
                        </div>
                    </form>
                `,
                width: '450px',
                showCancelButton: true,
                confirmButtonText: 'Update Product',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#1e40af',
                cancelButtonColor: '#64748b',
                customClass: {
                    popup: 'admin-swal-popup',
                    title: 'admin-swal-title',
                    confirmButton: 'admin-swal-confirm',
                    cancelButton: 'admin-swal-cancel'
                },
                preConfirm: () => {
                    const title = document.getElementById('editProductTitle').value;
                    const price = document.getElementById('editProductPrice').value;
                    const quantity = document.getElementById('editProductQuantity').value;
                    
                    if (!title || !price || !quantity) {
                        Swal.showValidationMessage('Please fill in all required fields');
                        return false;
                    }
                    
                    return {
                        title: title,
                        description: document.getElementById('editProductDescription').value,
                        price: parseFloat(price),
                        quantity: parseInt(quantity),
                        category: document.getElementById('editProductCategory').value,
                        image: document.getElementById('editProductImage').value,
                        isActive: document.getElementById('editProductActive').checked
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Show loading
                        Swal.fire({
                            title: 'Updating product...',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        const updateResponse = await fetch(`/admin/products/api/${productId}/update`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(result.value)
                        });

                        const updateData = await updateResponse.json();

                        if (updateData.success) {
                            Swal.fire({
                                title: 'Success!',
                                text: 'Product updated successfully',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            throw new Error(updateData.error || 'Failed to update product');
                        }
                    } catch (error) {
                        console.error('Error updating product:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to update product. Please try again.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error loading product for edit:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load product details. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    async deleteProduct(productId, productTitle) {
        const result = await Swal.fire({
            title: 'Delete Product',
            text: `Are you sure you want to delete "${productTitle}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
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
                    title: 'Deleting product...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch(`/admin/products/api/${productId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: `Product "${productTitle}" has been deleted`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'admin-swal-popup'
                        }
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    throw new Error(data.error || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete product. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'admin-swal-popup'
                    }
                });
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productsPage = new AdminProducts();
});

export default AdminProducts;
