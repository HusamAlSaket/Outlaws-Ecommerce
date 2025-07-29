
const nodemailer = require('nodemailer');
const contactEmailTemplate = require('../utils/contactEmailTemplate');

exports.getContactPage = (req, res) => {
  res.render('contact');
};

exports.postContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: name, email, and message are required.' 
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = contactEmailTemplate({ name, email, subject, message });

  try {
    await transporter.sendMail({
      from: `"Outlaws Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: subject ? `Contact: ${subject}` : `New Contact Message from ${name}`,
      html,
    });

    res.json({ 
      success: true, 
      message: 'Your message has been sent successfully! We\'ll get back to you soon.' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send your message. Please try again later.' 
    });
  }
};
