import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL || 'manoj456mth@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'rtgfbfyjocuobpiy',
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL || 'manoj456mth@gmail.com',
    to: email,
    subject,
    html: message,
  };

  try {
    console.log('📧 Attempting to send email to:', email);
    console.log('📧 Using SMTP user:', process.env.SMTP_MAIL || 'manoj456mth@gmail.com');
    
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log("❌ REAL EMAIL ERROR:", error.message); 
    console.log("❌ Error code:", error.code);
    console.log("❌ Response code:", error.responseCode);
    
    // For development, we'll simulate success but log the error
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log("🔧 Development mode: Simulating email success");
      return; // Don't throw error in development
    }
    
    throw error;
  }
};