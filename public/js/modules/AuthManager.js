/**
 * Auth Module
 * Handles authentication-related functionality
 */

class AuthManager {
    constructor() {
        this.isLoggingOut = false;
    }

    /**
     * Show logout confirmation with SweetAlert
     */
    confirmLogout(event) {
        event.preventDefault();
        
        if (this.isLoggingOut) return; // Prevent multiple logout attempts
        
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
            backdrop: `rgba(30, 58, 138, 0.4) left top no-repeat`
        }).then((result) => {
            if (result.isConfirmed) {
                this.performLogout();
            }
        });
    }

    /**
     * Perform logout with loading state
     */
    performLogout() {
        this.isLoggingOut = true;
        
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
        
        // Simulate logout process and redirect
        setTimeout(() => {
            this.redirectToLogout();
        }, 1000);
    }

    /**
     * Redirect to logout endpoint
     */
    redirectToLogout() {
        window.location.href = '/logout';
    }

    /**
     * Check authentication status
     */
    checkAuthStatus() {
        // Could be used to periodically check if user is still authenticated
        // For now, this is a placeholder for future implementation
        return true;
    }
}

export default AuthManager;
