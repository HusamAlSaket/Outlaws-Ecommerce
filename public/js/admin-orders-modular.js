/**
 * Admin Orders Management JavaScript
 * Handles order interactions, payment status toggles, and order details
 */

import BaseDashboard from './modules/BaseDashboard.js';
import AnimationsManager from './modules/AnimationsManager.js';
import AuthManager from './modules/AuthManager.js';

class AdminOrders extends BaseDashboard {
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
            console.error('Orders page initialization error:', error);
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
            breadcrumb.textContent = 'Admin / Orders';
        }
    }

    confirmLogout(event) {
        this.auth.confirmLogout(event);
    }

    setupGlobalFunctions() {
        // Make order management functions available globally
        window.toggleOrderPaymentStatus = this.toggleOrderPaymentStatus.bind(this);
        window.viewOrderDetails = this.viewOrderDetails.bind(this);
        window.editOrder = this.editOrder.bind(this);
        window.deleteOrder = this.deleteOrder.bind(this);
    }

    async toggleOrderPaymentStatus(orderId, orderNumber, newStatus) {
        const action = newStatus ? 'mark as paid' : 'mark as unpaid';
        const actionText = newStatus ? 'marked as paid' : 'marked as unpaid';
        
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)}`,
            text: `Are you sure you want to ${action} order "${orderNumber}"?`,
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
                    title: `${action.charAt(0).toUpperCase() + action.slice(1)}ing order...`,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch(`/admin/orders/api/${orderId}/toggle-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: `Order "${orderNumber}" has been ${actionText}`,
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
                    throw new Error(data.error || 'Failed to update order payment status');
                }
            } catch (error) {
                console.error('Error toggling order payment status:', error);
                // Revert the toggle switch
                const toggleSwitch = document.getElementById(`togglePayment${orderId}`);
                if (toggleSwitch) {
                    toggleSwitch.checked = !newStatus;
                }
                
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update order payment status. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'admin-swal-popup'
                    }
                });
            }
        } else {
            // User cancelled, revert the toggle switch
            const toggleSwitch = document.getElementById(`togglePayment${orderId}`);
            if (toggleSwitch) {
                toggleSwitch.checked = !newStatus;
            }
        }
    }

    async viewOrderDetails(orderId) {
        try {
            // Show loading
            Swal.fire({
                title: 'Loading order details...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(`/admin/orders/api/${orderId}/details`);
            const data = await response.json();

            if (data.success) {
                const order = data.order;
                
                // Prepare items HTML
                let itemsHtml = '';
                order.items.forEach(item => {
                    let imagePath = item.image;
                    if (imagePath && !imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
                        if (imagePath.startsWith('../public/')) {
                            imagePath = imagePath.replace('../public/', '/');
                        } else if (!imagePath.startsWith('/')) {
                            imagePath = '/' + imagePath;
                        }
                    }
                    
                    itemsHtml += `
                        <div class="order-item">
                            <div class="order-item-image-container">
                                ${imagePath ? 
                                    `<img src="${imagePath}" alt="${item.title}" class="order-item-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                     <div class="no-image" style="display: none; width: 50px; height: 50px; background: #f3f4f6; border-radius: 6px; align-items: center; justify-content: center; color: #9ca3af;"><i class="fas fa-image"></i></div>` :
                                    `<div class="no-image" style="width: 50px; height: 50px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af;"><i class="fas fa-image"></i></div>`
                                }
                            </div>
                            <div class="order-item-details">
                                <div class="order-item-title">${item.title}</div>
                                <div class="order-item-price">$${item.price} each</div>
                            </div>
                            <div class="order-item-quantity">x${item.qty}</div>
                        </div>
                    `;
                });
                
                Swal.fire({
                    title: `Order Details - #${order.orderNumber}`,
                    html: `
                        <div class="order-details-modal text-start">
                            <div class="order-details-content">
                                <div class="order-info-section">
                                    <h5><i class="fas fa-info-circle text-primary"></i> Order Information</h5>
                                    <div class="order-info-item">
                                        <span class="order-info-label">Order Number:</span>
                                        <span class="order-info-value">#${order.orderNumber}</span>
                                    </div>
                                    <div class="order-info-item">
                                        <span class="order-info-label">Total Amount:</span>
                                        <span class="order-info-value">$${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div class="order-info-item">
                                        <span class="order-info-label">Payment Status:</span>
                                        <span class="badge ${order.isPaid ? 'bg-success' : 'bg-warning'}">${order.isPaid ? 'Paid' : 'Unpaid'}</span>
                                    </div>
                                    <div class="order-info-item">
                                        <span class="order-info-label">Payment Method:</span>
                                        <span class="order-info-value">${order.paymentMethod || 'Cash on Delivery'}</span>
                                    </div>
                                    <div class="order-info-item">
                                        <span class="order-info-label">Order Date:</span>
                                        <span class="order-info-value">${new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div class="order-info-section">
                                    <h5><i class="fas fa-user text-primary"></i> Customer Information</h5>
                                    ${order.user ? `
                                        <div class="order-info-item">
                                            <span class="order-info-label">Name:</span>
                                            <span class="order-info-value">${order.user.username}</span>
                                        </div>
                                        <div class="order-info-item">
                                            <span class="order-info-label">Email:</span>
                                            <span class="order-info-value">${order.user.email}</span>
                                        </div>
                                    ` : `
                                        <div class="order-info-item">
                                            <span class="order-info-value text-muted">Guest User</span>
                                        </div>
                                    `}
                                    ${order.shippingInfo ? `
                                        <div class="order-info-item">
                                            <span class="order-info-label">Full Name:</span>
                                            <span class="order-info-value">${order.shippingInfo.fullName}</span>
                                        </div>
                                        <div class="order-info-item">
                                            <span class="order-info-label">Address:</span>
                                            <span class="order-info-value">${order.shippingInfo.address}</span>
                                        </div>
                                        <div class="order-info-item">
                                            <span class="order-info-label">City:</span>
                                            <span class="order-info-value">${order.shippingInfo.city}</span>
                                        </div>
                                        <div class="order-info-item">
                                            <span class="order-info-label">Country:</span>
                                            <span class="order-info-value">${order.shippingInfo.country}</span>
                                        </div>
                                        <div class="order-info-item">
                                            <span class="order-info-label">Postal Code:</span>
                                            <span class="order-info-value">${order.shippingInfo.postalCode}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div class="order-items-list">
                                    <h5><i class="fas fa-shopping-bag text-primary"></i> Order Items (${order.items.length})</h5>
                                    ${itemsHtml}
                                </div>
                            </div>
                        </div>
                    `,
                    width: '700px',
                    showConfirmButton: true,
                    confirmButtonText: 'Close',
                    confirmButtonColor: '#1e40af',
                    customClass: {
                        popup: 'admin-swal-popup-large',
                        title: 'admin-swal-title',
                        confirmButton: 'admin-swal-confirm'
                    }
                });
            } else {
                throw new Error(data.error || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load order details. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'admin-swal-popup'
                }
            });
        }
    }

    async editOrder(orderId) {
        try {
            // First fetch the order details
            const response = await fetch(`/admin/orders/api/${orderId}/details`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch order details');
            }

            const order = data.order;

            Swal.fire({
                title: `Edit Order Status (#${order.orderNumber})`,
                html: `
                    <form id="editOrderForm" class="edit-order-form text-start">
                        <div class="form-group mb-3">
                            <label for="editStatus" class="form-label">Order Status</label>
                            <select class="form-select" id="editStatus">
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Canceled</option>
                            </select>
                        </div>
                    </form>
                `,
                width: '500px',
                showCancelButton: true,
                confirmButtonText: 'Update Order',
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
                    return {
                        status: document.getElementById('editStatus').value
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Show loading
                        Swal.fire({
                            title: 'Updating order...',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        const updateResponse = await fetch(`/admin/orders/api/${orderId}/update`, {
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
                                text: 'Order updated successfully',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            throw new Error(updateData.error || 'Failed to update order');
                        }
                    } catch (error) {
                        console.error('Error updating order:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to update order. Please try again.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error loading order for edit:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load order details. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    async deleteOrder(orderId, orderNumber) {
        const result = await Swal.fire({
            title: 'Delete Order',
            text: `Are you sure you want to delete order "${orderNumber}"? This action cannot be undone.`,
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
                    title: 'Deleting order...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch(`/admin/orders/api/${orderId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: `Order "${orderNumber}" has been deleted`,
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
                    throw new Error(data.error || 'Failed to delete order');
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete order. Please try again.',
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
    window.ordersPage = new AdminOrders();
});

export default AdminOrders;
