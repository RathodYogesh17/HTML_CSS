import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  CheckCircleOutlined, 
  ArrowLeftOutlined 
} from "@ant-design/icons";
import { resetPassword } from "../../API/authAPI";
import { message, Spin } from "antd";
import '../../../public/css/password-otp.css'; 

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[A-Z]/, text: "One uppercase letter" },
  { regex: /[a-z]/, text: "One lowercase letter" },
  { regex: /[0-9]/, text: "One number" },
  { regex: /[^A-Za-z0-9]/, text: "One special character" },
] as const;

const STRENGTH_CONFIG = {
  colors: {
    weak: "#ef4444",
    fair: "#f59e0b",
    strong: "#10b981",
  },
  labels: ["Very Weak", "Weak", "Fair", "Good", "Strong"],
} as const;

interface PasswordStrength {
  score: number;
  percentage: number;
  text: string;
  color: string;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  const score = PASSWORD_REQUIREMENTS.filter((req) => req.regex.test(password)).length;
  const percentage = (score / PASSWORD_REQUIREMENTS.length) * 100;
  
  let color = STRENGTH_CONFIG.colors.weak;
  if (score >= 4) color = STRENGTH_CONFIG.colors.strong;
  else if (score >= 3) color = STRENGTH_CONFIG.colors.fair;
  
  return {
    score,
    percentage,
    text: STRENGTH_CONFIG.labels[score],
    color,
  };
};

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;
  const otp = location.state?.otp;

  const strength = useMemo(
    () => getPasswordStrength(formData.newPassword),
    [formData.newPassword]
  );

  useEffect(() => {
    if (!email || !otp) {
      message.error("Invalid reset password request. Please start over.");
      const timer = setTimeout(() => navigate("/forgot-password"), 2000);
      return () => clearTimeout(timer);
    }
    setValidating(false);
  }, [email, otp, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const validateForm = useCallback(() => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      message.error("Please fill in all fields");
      return false; }
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match");
      return false; }
    if (newPassword.length < 8) {
      message.error("Password must be at least 8 characters long");
      return false;}
    if (strength.score < 3) {
      message.error("Please choose a stronger password");
      return false;}

    return true;
  }, [formData, strength.score]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await resetPassword(email, otp, formData.newPassword);
      message.success("Password reset successfully! Please login with your new password.");
      
      sessionStorage.removeItem("resetEmail");
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === "OTP_EXPIRED") {
        message.error("OTP has expired. Please request a new one.");
        setTimeout(() => navigate("/forgot-password"), 2000);
      } else if (errorMessage === "INVALID_OTP") {
        message.error("Invalid OTP. Please start over.");
        setTimeout(() => navigate("/forgot-password"), 2000);
      } else {
        message.error(errorMessage || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-card">
          <Spin size="large" />
          <p className="auth-loading-text">Validating reset request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/forgot-password" className="auth-back-link">
          <ArrowLeftOutlined /> Back
        </Link>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="auth-icon-wrapper">
            <LockOutlined className="auth-icon" />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Create a new password for <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ marginBottom: 20 }}>
            <label className="auth-label">New Password</label>
            <div className="auth-input-wrapper">
              <LockOutlined className="auth-input-icon" />
              <input
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter new password"
                className="auth-input auth-password-input"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="auth-password-toggle"
              >
                {showPasswords.new ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>
          </div>

          {formData.newPassword && (
            <div className="password-strength-container">
              <div className="password-strength-header">
                <span className="password-strength-label" style={{ color: strength.color }}>
                  Password Strength: {strength.text}
                </span>
                <span className="password-strength-score">
                  {strength.score}/{PASSWORD_REQUIREMENTS.length}
                </span>
              </div>
              <div className="password-strength-bar">
                <div
                  className="password-strength-fill"
                  style={{
                    width: `${strength.percentage}%`,
                    background: strength.color,
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <LockOutlined className="auth-input-icon" />
              <input
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm new password"
                className="auth-input auth-password-input"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="auth-password-toggle"
              >
                {showPasswords.confirm ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>
          </div>

          {formData.newPassword && (
            <div className="password-requirements">
              <span className="password-requirements-title">
                Password Requirements:
              </span>
              <div className="password-requirements-list">
                {PASSWORD_REQUIREMENTS.map((req, index) => {
                  const isMet = req.regex.test(formData.newPassword);
                  return (
                    <div key={index} className="password-requirement-item">
                      <CheckCircleOutlined
                        className={`password-requirement-icon ${isMet ? 'valid' : 'invalid'}`}
                      />
                      <span
                        className={`password-requirement-text ${isMet ? 'valid' : 'invalid'}`}
                      >
                        {req.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          <p className="auth-helper-text">
            Password must be at least 8 characters with uppercase,<br />
            lowercase, number, and special character.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;