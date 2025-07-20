document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const form = this;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Convert FormData to URLSearchParams for proper form encoding
  const urlEncodedData = new URLSearchParams();
  for (const [key, value] of formData) {
    urlEncodedData.append(key, value);
  }
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
  
  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlEncodedData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Success SweetAlert with your brand colors
      Swal.fire({
        icon: 'success',
        title: 'Message Sent! 🎉',
        text: result.message,
        confirmButtonText: 'Awesome!',
        confirmButtonColor: '#001f3f',
        background: '#ffffff',
        color: '#001f3f',
        iconColor: '#001f3f',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        }
      });
      
      // Reset form
      form.reset();
      
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    // Error SweetAlert
    Swal.fire({
      icon: 'error',
      title: 'Oops! Something went wrong',
      text: error.message || 'Failed to send your message. Please try again.',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#001f3f',
      background: '#ffffff',
      color: '#001f3f',
      iconColor: '#dc3545'
    });
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});
