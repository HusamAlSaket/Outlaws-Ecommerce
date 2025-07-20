function confirmOrder() {
  // Get form data for validation
  const form = document.getElementById('checkoutForm');
  const formData = new FormData(form);
  
  // Check if all required fields are filled
  let isValid = true;
  const requiredFields = ['fullName', 'address', 'city', 'postalCode', 'country'];
  
  requiredFields.forEach(field => {
    if (!formData.get(field) || formData.get(field).trim() === '') {
      isValid = false;
    }
  });

  if (!isValid) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Information',
      text: 'Please fill in all required shipping information fields.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        content: 'swal2-content',
        confirmButton: 'swal2-confirm'
      }
    });
    return;
  }

  // Show confirmation dialog
  Swal.fire({
    icon: 'question',
    title: 'Confirm Your Order',
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <p><strong>Total Amount:</strong> $${window.totalAmount || '0.00'}</p>
        <p><strong>Payment Method:</strong> Cash on Delivery</p>
        <p style="color: #6c757d; font-size: 0.9rem; margin-top: 15px;">
          Your order will be processed and shipped to the provided address. 
          You'll pay when the package is delivered.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Yes, Place Order',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    customClass: {
      popup: 'swal2-popup',
      title: 'swal2-title',
      content: 'swal2-content',
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: 'Processing Order...',
        text: 'Please wait while we process your order.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          content: 'swal2-content'
        }
      });
      
      // Submit the form
      form.submit();
    }
  });
}
