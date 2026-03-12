import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { message } from "antd";
import { forgotPassword } from "../../API/authAPI";
import '../../../public/css/password-otp.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      message.success("OTP sent to your email successfully!");
      navigate("/verify-otp", { state: { email } });
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="auth-back-link">
          <ArrowLeftOutlined /> Back to login
        </Link>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="auth-icon-wrapper">
            <MailOutlined className="auth-icon" />
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you an OTP to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <MailOutlined className="auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="auth-info-box">
          <p className="auth-info-text">
            We'll send a 6-digit OTP to your email. Please check your inbox and spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;