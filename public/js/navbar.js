// Global function to update cart count
function updateCartBadge() {
    fetch('/api/cart/count')
        .then(response => response.json())
        .then(data => {
            const cartBadge = document.getElementById('cart-count');
            if (cartBadge) {
                if (data.count > 0) {
                    cartBadge.textContent = data.count;
                    cartBadge.classList.remove('hidden');
                    // Add pulse animation when count changes
                    cartBadge.style.animation = 'none';
                    setTimeout(() => cartBadge.style.animation = 'pulse 0.3s ease', 10);
                } else {
                    cartBadge.classList.add('hidden');
                }
            }
        })
        .catch(error => console.error('Error updating cart count:', error));
}

// Global addToCart function (available on all pages)
function addToCart(productId, button, quantity = 1) {
    // Visual feedback (before request)
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    button.disabled = true;

    // Send request with quantity parameter
    fetch(`/cart/add/${productId}?qty=${quantity}`)
        .then(async (res) => {
            if (res.ok) {
                // ✅ Visual feedback success
                button.innerHTML = '<i class="fas fa-check"></i> Added!';
                button.style.background = "linear-gradient(135deg, #28a745, #20c997)";
                
                // Update cart badge in navbar
                updateCartBadge();
            } else {
                // Handle error response (stock issues)
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to add to cart");
            }
        })
        .catch((error) => {
            button.innerHTML = '<i class="fas fa-times"></i> Error';
            button.style.background = "#dc3545";
            
            // Show stock error message
            if (error.message.includes('stock') || error.message.includes('available')) {
                alert(error.message);
            } else {
                alert('Error adding item to cart');
            }
        })
        .finally(() => {
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = "";
                button.disabled = false;
            }, 2000);
        });
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
});

// Make functions globally accessible
window.updateCartBadge = updateCartBadge;
window.addToCart = addToCart;
