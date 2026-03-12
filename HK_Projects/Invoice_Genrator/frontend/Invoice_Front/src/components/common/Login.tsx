import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../../store/slices/authSlice";
import { loginUser } from "../../API/authAPI";
import { MailOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { message } from "antd";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(email, password);

      if (!res.data?.user || !res.data?.token) {
        message.error("Login failed: Invalid response");
        setLoading(false);
        return;
      }

      dispatch(
        setCredentials({ user: res.data.user, token: res.data.token })
      );
      message.success("Login successful!");
      navigate("/invoices");
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          padding: "40px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: "#000000",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6-2.28 0-2.56 4-4 6-4s6 1.44 6 4c-1.57 1.46-3.97 2.28-6 2.28z"
                fill="white"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1e293b",
              margin: "0 0 8px 0",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Email Address
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MailOutlined
                style={{
                  position: "absolute",
                  left: 16,
                  color: "#94a3b8",
                  fontSize: 18,
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 48px",
                  border: "2px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s",
                  background: "#f8fafc",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#000000")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LockOutlined
                style={{
                  position: "absolute",
                  left: 16,
                  color: "#94a3b8",
                  fontSize: 18,
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 48px",
                  border: "2px solid #e2e8f0",
                  borderRadius: 12,
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s",
                  background: "#f8fafc",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#000000")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 24,
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                color: "#000000",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.3s",
              marginBottom: 24,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#000000",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;