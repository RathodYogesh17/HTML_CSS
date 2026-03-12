import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { message } from "antd";
import { verifyOTP, forgotPassword } from "../../API/authAPI";
import '../../../public/css/password-otp.css'; 

// Constants
const OTP_LENGTH = 6;
const TIMER_DURATION = 60;

const VerifyOTP = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Memoized values
  const isOtpComplete = useMemo(
    () => otp.every(digit => digit !== ""),
    [otp]
  );

  const otpString = useMemo(() => otp.join(""), [otp]);

  // Effects
  useEffect(() => {
    if (!email) {
      message.error("No email provided. Please start again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    setCanResend(true);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handlers
  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== "")) {
      setTimeout(() => handleAutoSubmit(newOtp.join("")), 100);
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    const actions: Record<string, () => void> = {
      Backspace: () => {
        if (!otp[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      },
      ArrowLeft: () => {
        if (index > 0) inputRefs.current[index - 1]?.focus();
      },
      ArrowRight: () => {
        if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
      },
    };

    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      setTimeout(() => handleAutoSubmit(pastedData), 100);
    } else {
      message.error(`Please paste a valid ${OTP_LENGTH}-digit OTP`);
    }
  }, []);

  const handleAutoSubmit = async (otpValue: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await verifyOTP(email, otpValue);
      message.success("OTP verified successfully!");
      navigate("/reset-password", { 
        state: { email, otp: otpValue } 
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || "Invalid OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOtpComplete) {
      message.error("Please enter complete 6-digit OTP");
      return;
    }

    await handleAutoSubmit(otpString);
  }, [isOtpComplete, otpString]);

  const handleResend = useCallback(async () => {
    if (!canResend || resendLoading) return;
    
    setResendLoading(true);
    try {
      await forgotPassword(email);
      message.success("OTP resent successfully! Please check your email.");
      setTimer(TIMER_DURATION);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  }, [canResend, resendLoading, email]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/forgot-password" className="auth-back-link">
          <ArrowLeftOutlined /> Back
        </Link>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="auth-icon-wrapper">
            <svg
              className="auth-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="auth-title">Verify OTP</h1>
          <p className="auth-subtitle">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="auth-form">
          <div style={{ marginBottom: 24 }}>
            <label className="auth-label" style={{ textAlign: "center" }}>
              Enter OTP Code
            </label>
            <div className="otp-container" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  disabled={loading}
                  className="otp-input"
                  onFocus={(e) => !loading && e.target.select()}
                />
              ))}
            </div>
            <p className="otp-helper-text">
              You can paste the OTP code directly
            </p>
          </div>

          <div className="auth-timer-container">
            <ClockCircleOutlined />
            <span className={timer > 0 ? "auth-timer-text" : "auth-timer-expired"}>
              {timer > 0
                ? `Resend OTP in ${formatTime(timer)}`
                : "OTP expired"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className="auth-btn-secondary"
          >
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;