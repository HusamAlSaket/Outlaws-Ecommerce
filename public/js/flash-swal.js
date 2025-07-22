// SweetAlert2 logout confirmation with animated icon and gradient card
document.addEventListener('DOMContentLoaded', function() {
  var logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      Swal.fire({
        title: `
        <div class="outlaws-modal-header">
          <span class="outlaws-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="vertical-align:middle;margin-right:6px;"><path d="M7 14L14 2l-2 8h6l-7 12 2-8H7z" fill="#fff"/></svg>
            <span class="outlaws-logo-text">Outlaws</span>
          </span>
        </div>
        <div class="outlaws-modal-title-row">
          <span class="outlaws-modal-icon">
            <i class="bi bi-box-arrow-right" style="font-size:2rem;color:#0a2240;"></i>
          </span>
          <span class="outlaws-modal-title">Log out?</span>
        </div>
        `,
        html: `<div class="outlaws-modal-desc">Are you sure you want to log out?</div>`,
        showCancelButton: true,
        confirmButtonText: '<span style="font-weight:700;">Yes, log me out</span>',
        cancelButtonText: '<span style="font-weight:600;">Cancel</span>',
        background: 'rgba(255,255,255,0.75)',
        color: '#002147',
        iconColor: '#1e90ff',
        confirmButtonColor: '#0a2240',
        cancelButtonColor: '#e5e7eb',
        focusCancel: true,
        customClass: {
          popup: 'outlaws-modal-popup',
          confirmButton: 'outlaws-modal-confirm',
          cancelButton: 'outlaws-modal-cancel',
          title: '',
          htmlContainer: '',
        },
        didOpen: () => {
          // Animate the logout icon arrow
          setTimeout(() => {
            const icon = document.querySelector('.outlaws-modal-icon svg');
            if (icon && icon.animate) {
              icon.animate([
                { transform: 'translateX(-6px)' },
                { transform: 'translateX(0)' }
              ], {
                duration: 900,
                direction: 'alternate',
                iterations: Infinity,
                easing: 'cubic-bezier(.4,1.6,.6,1)'
              });
            }
          }, 100);
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: '<span style="font-size:1.5rem;font-weight:700;color:#002147;font-family:Barlow,Arial,sans-serif;">Logged out!</span>',
            html: '<div style="font-size:1.08rem;font-weight:500;margin-top:8px;color:#444;font-family:Barlow,Arial,sans-serif;">You have been logged out successfully.</div>',
            icon: 'success',
            background: 'linear-gradient(135deg, #fafdff 60%, #e6f0fa 100%)',
            color: '#002147',
            iconColor: '#1e90ff',
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
            customClass: {
              popup: 'outlaws-swal-popup',
              title: 'outlaws-swal-title',
              htmlContainer: 'outlaws-swal-html',
            },
            didClose: () => {
              window.location.href = '/logout';
            }
          });
        }
      });

      // Animate the SVG arrow
      setTimeout(() => {
        const arrow = document.querySelector('.outlaws-logout-arrow');
        if (arrow && arrow.animate) {
          arrow.animate([
            { transform: 'translateY(-12px)' },
            { transform: 'translateY(0)' }
          ], {
            duration: 800,
            direction: 'alternate',
            iterations: Infinity,
            easing: 'cubic-bezier(.4,1.6,.6,1)'
          });
        }
      }, 100);
    });
  }
});

// Ensure Bootstrap Icons CSS is loaded for modal icon
if (!document.querySelector('link[href*="bootstrap-icons"]')) {
  const bi = document.createElement('link');
  bi.rel = 'stylesheet';
  bi.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
  document.head.appendChild(bi);
}

// Custom SweetAlert2 styles for Outlaws login-card look
const style = document.createElement('style');
style.innerHTML = `
.outlaws-modal-popup {
  border-radius: 18px !important;
  background: #fff !important;
  color: #002147 !important;
  box-shadow: 0 6px 24px 0 rgba(10,34,64,0.16) !important;
  padding: 22px 22px 18px 22px !important;
  min-width: 320px !important;
  border: none !important;
  max-width: 96vw !important;
}
.outlaws-modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.outlaws-logo {
  display: flex;
  align-items: center;
  font-family: 'Barlow', Arial, sans-serif;
  font-weight: 900;
  font-size: 1.18rem;
  color: #fff;
  letter-spacing: 0.5px;
  background: #0a2240;
  border-radius: 8px;
  padding: 2px 14px 2px 4px;
  box-shadow: 0 2px 8px rgba(10,34,64,0.08);
  margin-bottom: 8px;
}
.outlaws-logo-text {
  color: #fff;
  font-weight: 900;
  font-size: 1.18rem;
  margin-left: 2px;
  letter-spacing: 0.5px;
}
.outlaws-modal-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.outlaws-modal-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #e3eaf3;
  border-radius: 7px;
  box-shadow: 0 1px 4px rgba(10,34,64,0.07);
  border: 1.2px solid #d1d9e6;
}
.outlaws-modal-title {
  font-family: 'Barlow', Arial, sans-serif;
  font-weight: 800;
  font-size: 2rem;
  color: #0a2240;
  letter-spacing: 0.5px;
}
.outlaws-modal-desc {
  font-size: 1.13rem;
  font-family: 'Barlow', Arial, sans-serif;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 18px;
  margin-top: 2px;
}
.outlaws-modal-confirm {
  background: #0a2240 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  font-family: 'Barlow', Arial, sans-serif !important;
  box-shadow: 0 2px 12px rgba(10,34,64,0.10) !important;
  padding: 14px 36px !important;
  font-size: 1.12rem !important;
  margin-left: 12px !important;
  margin-right: 0 !important;
  transition: background 0.2s;
  letter-spacing: 0.2px;
  outline: none !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}
.outlaws-modal-confirm:hover {
  background: #002147 !important;
  color: #fff !important;
}
.outlaws-modal-cancel {
  background: #e5e7eb !important;
  color: #0a2240 !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-family: 'Barlow', Arial, sans-serif !important;
  box-shadow: 0 2px 8px rgba(10,34,64,0.06) !important;
  padding: 14px 36px !important;
  font-size: 1.08rem !important;
  margin-right: 12px !important;
  transition: background 0.2s;
}
`;
document.head.appendChild(style);