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
                    }
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
            // Show loading in modal
            const modalElement = document.getElementById('orderDetailsModal');
            const modal = new bootstrap.Modal(modalElement);
            
            document.getElementById('orderDetailsContent').innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading order details...</p>
                </div>
            `;
            
            modal.show();

            const response = await fetch(`/admin/orders/api/${orderId}/details`);
            const data = await response.json();

            if (data.success) {
                const order = data.order;
                
                // Format date
                const orderDate = new Date(order.createdAt).toLocaleString();
                
                // Calculate total
                const total = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                
                // Build order details HTML
                const orderDetailsHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Order Information</h6>
                                </div>
                                <div class="card-body">
                                    <table class="table table-borderless table-sm">
                                        <tr>
                                            <td class="fw-bold">Order ID:</td>
                                            <td>${order._id}</td>
                                        </tr>
                                        <tr>
                                            <td class="fw-bold">Order Number:</td>
                                            <td>#${order.orderNumber}</td>
                                        </tr>
                                        <tr>
                                            <td class="fw-bold">Date:</td>
                                            <td>${orderDate}</td>
                                        </tr>
                                        <tr>
                                            <td class="fw-bold">Payment Status:</td>
                                            <td><span class="badge bg-${order.isPaid ? 'success' : 'warning'}">${order.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                                        </tr>
                                        <tr>
                                            <td class="fw-bold">Payment Method:</td>
                                            <td>${order.paymentMethod || 'Cash on Delivery'}</td>
                                        </tr>
                                        <tr>
                                            <td class="fw-bold">Total:</td>
                                            <td class="fw-bold text-primary">$${order.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h6 class="mb-0"><i class="fas fa-user me-2"></i>Customer Information</h6>
                                </div>
                                <div class="card-body">
                                    <table class="table table-borderless table-sm">
                                        ${order.user ? `
                                            <tr>
                                                <td class="fw-bold">Name:</td>
                                                <td>${order.user.username}</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">Email:</td>
                                                <td>${order.user.email}</td>
                                            </tr>
                                        ` : `
                                            <tr>
                                                <td colspan="2" class="text-muted">Guest User</td>
                                            </tr>
                                        `}
                                        ${order.shippingInfo ? `
                                            <tr>
                                                <td class="fw-bold">Full Name:</td>
                                                <td>${order.shippingInfo.fullName}</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">Address:</td>
                                                <td>${order.shippingInfo.address}</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">City:</td>
                                                <td>${order.shippingInfo.city}</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">Country:</td>
                                                <td>${order.shippingInfo.country}</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">Postal Code:</td>
                                                <td>${order.shippingInfo.postalCode}</td>
                                            </tr>
                                        ` : ''}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-shopping-cart me-2"></i>Order Items (${order.items.length})</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Image</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => {
                                            let imagePath = item.image;
                                            if (imagePath && !imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
                                                if (imagePath.startsWith('../public/')) {
                                                    imagePath = imagePath.replace('../public/', '/');
                                                } else if (!imagePath.startsWith('/')) {
                                                    imagePath = '/' + imagePath;
                                                }
                                            }
                                            
                                            return `
                                                <tr>
                                                    <td class="fw-medium">${item.title}</td>
                                                    <td>
                                                        ${imagePath ? 
                                                            `<img src="${imagePath}" alt="${item.title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                             <div class="bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 4px; display: none;"><i class="fas fa-image text-muted"></i></div>` :
                                                            '<div class="bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; border-radius: 4px;"><i class="fas fa-image text-muted"></i></div>'
                                                        }
                                                    </td>
                                                    <td>$${item.price.toFixed(2)}</td>
                                                    <td>${item.qty}</td>
                                                    <td class="fw-medium">$${(item.price * item.qty).toFixed(2)}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-light">
                                            <th colspan="4" class="text-end">Total:</th>
                                            <th class="text-primary">$${order.totalAmount.toFixed(2)}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                
                // Update modal content
                document.getElementById('orderDetailsContent').innerHTML = orderDetailsHTML;
                
            } else {
                throw new Error(data.error || 'Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            
            // Show error in modal
            document.getElementById('orderDetailsContent').innerHTML = `
                <div class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h5>Error Loading Order Details</h5>
                    <p>Failed to load order details. Please try again.</p>
                </div>
            `;
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
            
            // Show status edit dialog
            const result = await Swal.fire({
                title: `Edit Order Status - #${order.orderNumber}`,
                html: `
                    <div class="text-start">
                        <div class="mb-3">
                            <label for="orderStatus" class="form-label fw-bold">Order Status</label>
                            <select class="form-control" id="orderStatus">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                        <div class="alert alert-info">
                            <small><i class="fas fa-info-circle me-2"></i>Current status: <strong>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</strong></small>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Update Status',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#007bff',
                width: '400px',
                preConfirm: () => {
                    const status = document.getElementById('orderStatus').value;
                    if (!status) {
                        Swal.showValidationMessage('Please select a status');
                        return false;
                    }
                    return status;
                }
            });

            if (result.isConfirmed) {
                const newStatus = result.value;
                
                // Only update if status changed
                if (newStatus !== order.status) {
                    await this.updateOrderStatus(orderId, newStatus);
                } else {
                    Swal.fire({
                        title: 'No Changes',
                        text: 'Status was not changed.',
                        icon: 'info',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            }

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

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, newStatus) {
        try {
            this.animations.showLoader();

            const response = await fetch(`/admin/orders/api/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated!',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Reload the page to show updated status
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message || 'Failed to update order status',
            });
        } finally {
            this.animations.hideLoader();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ordersPage = new AdminOrders();
});

// Make updateOrderStatus available globally
window.updateOrderStatus = (orderId, newStatus) => {
    if (window.ordersPage) {
        window.ordersPage.updateOrderStatus(orderId, newStatus);
    }
};

export default AdminOrders;
