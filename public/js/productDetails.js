// Product details specific function that gets quantity and calls global addToCart
function addToCartWithQuantity(productId, button) {
  // Get quantity from input
  const quantityInput = document.getElementById('quantity');
  const quantity = parseInt(quantityInput.value) || 1;
  
  // Call the global addToCart function with the quantity
  addToCart(productId, button, quantity);
}
