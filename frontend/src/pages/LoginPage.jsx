import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import "./LoginPage.css";

const LoginPage = () => {
  const GOOGLE_CLIENT_ID =
    "554198995901-agr3ug4qtl7oo7q5o86686fn1sl0knds.apps.googleusercontent.com";

  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required.";
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleLoginSuccess = useCallback((data) => {
    localStorage.setItem("user", JSON.stringify(data));
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    }

    if (data.role === "SUPERADMIN") {
      window.location.href = "/superadmin/dashboard";
      return;
    }

    window.location.href = "/";
  }, []);

  const handleGoogleCredentialLogin = useCallback(
    async (response) => {
      if (!response?.credential) {
        setServerError("Google login failed. Please try again.");
        return;
      }

      setServerError("");
      setGoogleLoading(true);

      try {
        const loginResponse = await fetch(
          "http://localhost:8080/api/auth/google/student-login",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ credential: response.credential }),
          },
        );

        const data = await loginResponse.json();

        if (loginResponse.ok) {
          handleLoginSuccess(data);
          return;
        }

        setServerError(
          data.message || "Google login failed. Please try again.",
        );
      } catch {
        setServerError(
          "Could not connect to the server. Please try again later.",
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [handleLoginSuccess],
  );

  useEffect(() => {
    if (loginRole !== "student") {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
      return;
    }

    const googleAccounts = window.google?.accounts?.id;
    if (!googleAccounts) {
      setServerError(
        "Google Sign-In is not available right now. Please refresh the page.",
      );
      return;
    }

    googleAccounts.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialLogin,
    });

    const renderGoogleButton = () => {
      if (!googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      const buttonWidth = Math.min(
        400,
        Math.max(200, Math.floor(googleButtonRef.current.offsetWidth)),
      );
      googleAccounts.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: buttonWidth,
        text: "continue_with",
      });
    };

    renderGoogleButton();
    window.addEventListener("resize", renderGoogleButton);

    return () => {
      window.removeEventListener("resize", renderGoogleButton);
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
    };
  }, [GOOGLE_CLIENT_ID, handleGoogleCredentialLogin, loginRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        setServerError(
          data.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setServerError(
        "Could not connect to the server. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-page">
        <div className="auth-header">
          <h2>Login</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-selection">
            <span className="role-label">Login as</span>
            <div className="role-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="loginRole"
                  value="student"
                  checked={loginRole === "student"}
                  onChange={() => setLoginRole("student")}
                />
                <span className="radio-custom"></span>
                Student
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="loginRole"
                  value="tutor"
                  checked={loginRole === "tutor"}
                  onChange={() => setLoginRole("tutor")}
                />
                <span className="radio-custom"></span>
                Tutor
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" size={14} className="forgot-password">
              Forgot password?
            </Link>
          </div>

          {serverError && (
            <div className="alert alert-error mb-4">{serverError}</div>
          )}

          <button
            type="submit"
            className="primary-btn full-width mt-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {loginRole === "student" && (
            <>
              <div className="oauth-divider">
                <span>or</span>
              </div>
              <div className="google-login-block">
                <div id="googleSignInDiv" ref={googleButtonRef}></div>
                {googleLoading && (
                  <span className="google-loading-text">
                    Completing Google login...
                  </span>
                )}
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
