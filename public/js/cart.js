function updateQuantity(productId, change) {
  // Reuse existing addToCart endpoint with positive/negative quantity
  fetch(`/cart/add/${productId}?qty=${change}`, {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(async response => {
      if (response.ok) {
        // Reload page to show updated cart
        window.location.reload();
      } else {
        // Handle stock errors
        const errorData = await response.json();
        alert(errorData.error || 'Error updating quantity. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error updating quantity. Please try again.');
    });
}
