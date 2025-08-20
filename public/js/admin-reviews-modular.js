// Modular JS for admin reviews dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Toggle review visibility
    document.querySelectorAll('.toggle-switch').forEach(function(toggle) {
        toggle.addEventListener('change', function() {
            const reviewId = this.id.replace('toggleReview', '');
            const isVisible = this.checked;
            fetch(`/admin/reviews/${reviewId}/toggle-visibility`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ isVisible })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Review status updated',
                        timer: 1200,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Could not update review status.'
                    });
                }
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'Could not update review status.'
                });
            });
        });
    });

    // Delete review
    document.querySelectorAll('.table-action-btn.btn-danger').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const reviewId = this.closest('tr').querySelector('.toggle-switch').id.replace('toggleReview', '');
            Swal.fire({
                title: 'Delete Review?',
                text: 'This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Delete'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/admin/reviews/${reviewId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Review deleted',
                                timer: 1200,
                                showConfirmButton: false
                            });
                            this.closest('tr').remove();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: data.message || 'Could not delete review.'
                            });
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Network Error',
                            text: 'Could not delete review.'
                        });
                    });
                }
            });
        });
    });
});
