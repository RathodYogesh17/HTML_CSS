import nodemailer from "nodemailer";

// Create transporter with proper SSL/TLS configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // Use 587 for TLS
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // This fixes self-signed certificate issues
    ciphers: 'SSLv3'
  },
  debug: true, // Enable debug logs
  logger: true // Log information
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"Medical Invoice System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP - Medical Invoice System",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 10px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: #000000;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
            background: white;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e2e8f0;
          }
          .otp-code {
            text-align: center;
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #000000;
            padding: 20px;
            margin: 20px 0;
            background: #f8fafc;
            border-radius: 10px;
            border: 2px dashed #000000;
          }
          .warning {
            color: #ef4444;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Medical Invoice System</h1>
          </div>
          <div class="content">
            <h2 style="text-align: center; color: #1e293b;">Password Reset Request</h2>
            <p style="text-align: center; color: #64748b;">
              You requested to reset your password. Use the following OTP code to proceed:
            </p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <p style="text-align: center; color: #64748b;">
              This OTP is valid for <strong>5 minutes</strong>.
            </p>
            
            <div class="warning">
              ⚠️ If you didn't request this, please ignore this email or contact support.
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px;">
              <p style="margin: 0; color: #475569; font-size: 14px;">
                <strong>Security Tips:</strong><br>
                • Never share this OTP with anyone<br>
                • Our team will never ask for your password<br>
                • Use a strong password for your account
              </p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Medical Invoice System. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log("Attempting to send email to:", email);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Detailed email error:", error);
    throw new Error("FAILED_TO_SEND_EMAIL");
  }
};