// utils/contactEmailTemplate.js

module.exports = function contactEmailTemplate({ name, email, subject, message }) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; color: #001f3f; padding: 32px; border-radius: 16px; border: 2px solid #001f3f; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #001f3f; font-size: 28px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
          🏴‍☠️ Outlaws Contact
        </h1>
        <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #001f3f, #003366); margin: 12px auto; border-radius: 2px;"></div>
      </div>
      
      <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; border-left: 4px solid #001f3f; margin-bottom: 24px;">
        <h2 style="color: #001f3f; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">
          New Message from ${name}
        </h2>
        <div style="display: grid; gap: 12px;">
          <p style="margin: 0; font-size: 16px;"><strong style="color: #001f3f;">Name:</strong> <span style="color: #333;">${name}</span></p>
          <p style="margin: 0; font-size: 16px;"><strong style="color: #001f3f;">Email:</strong> <a href="mailto:${email}" style="color: #001f3f; text-decoration: none; font-weight: 500;">${email}</a></p>
          ${subject ? `<p style="margin: 0; font-size: 16px;"><strong style="color: #001f3f;">Subject:</strong> <span style="color: #333;">${subject}</span></p>` : ''}
        </div>
      </div>
      
      <div style="background: #001f3f; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h3 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 16px 0; display: flex; align-items: center;">
          <span style="margin-right: 8px;">💬</span> Message
        </h3>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 8px; border-left: 3px solid white;">
          <span style="white-space: pre-line; font-size: 16px; line-height: 1.6;">${message}</span>
        </div>
      </div>
      
      <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px dashed #001f3f;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <span style="color: #001f3f; font-weight: 600;">💡 Pro Tip:</span> 
          Reply directly to this email to respond to ${name}
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          Sent from <strong style="color: #001f3f;">Outlaws Ecommerce</strong> Contact Form
        </p>
      </div>
    </div>
  `;
};
