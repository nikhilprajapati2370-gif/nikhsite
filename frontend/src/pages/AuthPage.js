import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthPage = ({ mode = "login" }) => {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const formatError = (detail) => {
    if (!detail) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
    return String(detail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(form.email, form.password);
        navigate(user.role === "admin" ? "/admin" : from);
      } else {
        await register(form.name, form.email, form.password);
        navigate(from);
      }
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />
        <div className="absolute inset-0 circuit-bg opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-16 max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
              <Cpu size={20} className="text-black" />
            </div>
            <span className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Build<span className="text-primary">oreo</span>
            </span>
          </Link>
          <h2 className="text-4xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Gateway to <span className="text-primary">Electronics</span> Innovation
          </h2>
          <p className="mt-4 text-gray-400 text-sm leading-relaxed">
            Join thousands of makers, engineers, and students who trust Buildoreo for their component needs.
          </p>
          <div className="mt-8 space-y-3">
            {["10,000+ Products in stock", "Genuine components guaranteed", "Fast pan-India delivery"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-sm text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <Cpu size={16} className="text-black" />
            </div>
            <span className="text-xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Build<span className="text-primary">oreo</span>
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? "Sign in to your Buildoreo account" : "Join the maker community today"}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-md bg-muted border border-white/10 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${isLogin ? "bg-primary text-black" : "text-gray-400 hover:text-white"}`}
              data-testid="login-tab"
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${!isLogin ? "bg-primary text-black" : "text-gray-400 hover:text-white"}`}
              data-testid="register-tab"
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md" data-testid="auth-error">
              <AlertCircle size={14} className="text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="w-full bg-input border border-white/10 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder-gray-600"
                  data-testid="name-input"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-input border border-white/10 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder-gray-600"
                data-testid="email-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-input border border-white/10 text-white text-sm px-4 py-3 pr-10 rounded-md focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder-gray-600"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required={!isLogin}
                  className="w-full bg-input border border-white/10 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder-gray-600"
                  data-testid="confirm-password-input"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-md text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              data-testid="auth-submit-button"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
