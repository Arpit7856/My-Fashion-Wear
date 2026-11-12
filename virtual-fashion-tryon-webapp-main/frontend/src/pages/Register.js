import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import loginImage from "../assets/img5.png";

const API_BASE = "http://localhost:8000/api";

// ─── Step 1: Registration form ────────────────────────────────────────────────
function RegisterForm({ onOtpSent }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.error ||
          Object.values(data).flat().join(" ") ||
          "Registration failed.";
        setError(msg);
        return;
      }

      onOtpSent(form.email);
    } catch {
      setError("Network error. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box register-box">
      <h2>Create Account</h2>

      {error && (
        <p style={{ color: "#ff6b6b", marginBottom: "12px", fontSize: "14px" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={form.full_name}
          onChange={handle("full_name")}
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handle("email")}
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          placeholder="Enter phone number"
          value={form.phone}
          onChange={handle("phone")}
        />

        <label>Password</label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          value={form.password}
          onChange={handle("password")}
          required
          minLength={8}
        />

        <label>Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={form.confirm_password}
          onChange={handle("confirm_password")}
          required
        />

        <label className="register-show-pw">
          <input
            type="checkbox"
            id="show-password-toggle"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          &nbsp;Show Password
        </label>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Sending OTP…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}

// ─── Step 2: OTP verification ─────────────────────────────────────────────────
function OtpForm({ email, onSuccess }) {
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }

      setSuccess("Account created! Redirecting to login…");
      setTimeout(onSuccess, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box register-box">
      <h2>Verify Email</h2>
      <p style={{ marginBottom: "16px", fontSize: "14px", opacity: 0.8 }}>
        An OTP has been sent to <strong>{email}</strong>. Enter it below.
      </p>

      {error   && <p style={{ color: "#ff6b6b",  marginBottom: "12px", fontSize: "14px" }}>{error}</p>}
      {success && <p style={{ color: "#6bff9e", marginBottom: "12px", fontSize: "14px" }}>{success}</p>}

      <form onSubmit={handleVerify}>
        <label>OTP Code</label>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Verifying…" : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}

// ─── Main Register page ───────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]   = useState("register"); // "register" | "otp"
  const [email, setEmail] = useState("");

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      <div className="login-overlay"></div>

      {step === "register" ? (
        <RegisterForm
          onOtpSent={(sentEmail) => {
            setEmail(sentEmail);
            setStep("otp");
          }}
        />
      ) : (
        <OtpForm email={email} onSuccess={() => navigate("/login")} />
      )}

      <p
        className="login-register-text"
        style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)" }}
      >
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
}
