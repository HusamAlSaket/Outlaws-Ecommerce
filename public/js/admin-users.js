/**
 * Admin Users Management JavaScript
 * Handles user interactions, status toggles, and user details
 */

import BaseDashboard from './modules/BaseDashboard.js';
import AnimationsManager from './modules/AnimationsManager.js';
import AuthManager from './modules/AuthManager.js';

class AdminUsers extends BaseDashboard {
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
            console.error('Users page initialization error:', error);
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
            breadcrumb.textContent = 'Admin / Users';
        }
    }

    confirmLogout(event) {
        this.auth.confirmLogout(event);
    }
}

// Global functions for user management
window.toggleUserStatus = async function(userId, username, isActive) {
    const action = isActive ? 'deactivate' : 'activate';
    const actionText = isActive ? 'deactivated' : 'activated';
    
    const result = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        text: `Are you sure you want to ${action} ${username}?`,
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
                title: `${action.charAt(0).toUpperCase() + action.slice(1)}ing user...`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(`/admin/api/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: `User ${username} has been ${actionText}`,
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
                throw new Error(data.error || 'Failed to update user status');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update user status. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'admin-swal-popup'
                }
            });
        }
    }
};

window.viewUserDetails = async function(userId) {
    try {
        // Show loading
        Swal.fire({
            title: 'Loading user details...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`/admin/api/users/${userId}/details`);
        const data = await response.json();

        if (data.success) {
            const user = data.user;
            
            // Handle image path formatting
            let imagePath = user.image;
            if (imagePath) {
                if (imagePath.startsWith('../public/')) {
                    imagePath = imagePath.replace('../public/', '/');
                } else if (!imagePath.startsWith('/')) {
                    imagePath = '/' + imagePath;
                }
            }
            
            Swal.fire({
                title: `User Details: ${user.username}`,
                html: `
                    <div class="user-details-modal">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="user-avatar-lg mb-3">
                                    ${user.image ? 
                                        `<img src="${imagePath}" alt="${user.username}" class="img-fluid rounded-circle" 
                                              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                         <i class="fas fa-user fa-4x" style="display: none;"></i>` :
                                        `<i class="fas fa-user fa-4x"></i>`
                                    }
                                </div>
                            </div>
                            <div class="col-md-8">
                                <table class="table table-borderless">
                                    <tr>
                                        <td><strong>Username:</strong></td>
                                        <td>${user.username}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td>${user.email}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Role:</strong></td>
                                        <td>
                                            <span class="badge bg-${user.isAdmin ? 'danger' : 'secondary'}">
                                                ${user.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td>
                                            <span class="badge bg-${user.isActive ? 'success' : 'warning'}">
                                                ${user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Joined:</strong></td>
                                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                `,
                width: 600,
                confirmButtonText: 'Close',
                customClass: {
                    popup: 'admin-swal-popup',
                    title: 'admin-swal-title',
                    htmlContainer: 'admin-swal-text',
                    confirmButton: 'admin-swal-confirm'
                }
            });
        } else {
            throw new Error(data.error || 'Failed to fetch user details');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to load user details. Please try again.',
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
    window.usersPage = new AdminUsers();
});

export default AdminUsers;