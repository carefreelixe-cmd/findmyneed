import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase, FiHome } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(27, 58, 95, 0.92), rgba(44, 62, 80, 0.88)), url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white hover:text-success-green transition-colors mb-6 text-sm font-medium"
        >
          <FiHome className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-success-green to-green-600 rounded-2xl mb-4 shadow-2xl">
            <FiBriefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-200">Sign in to continue to ServiceHub</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-alert-red rounded-lg flex items-start gap-3">
            <div className="text-alert-red mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-alert-red font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-brand-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                  required
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-brand-charcoal mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                  tabIndex="-1"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#00A86B" }}
              className="w-full text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 text-base mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In to ServiceHub"
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Card */}
        <div className="bg-white/90 backdrop-blur-sm border-2 border-success-green/30 rounded-2xl p-5 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-success-green rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🎯</span>
            </div>
            <p className="text-sm font-bold text-brand-navy uppercase tracking-wide">
              Demo Credentials
            </p>
          </div>
          <div className="space-y-2 bg-gray-50 rounded-xl p-3">
            <div className="text-sm">
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Email:</span>
              </p>
              <p className="text-success-green font-mono font-bold bg-white px-3 py-2 rounded-lg">
                admin@marketplace.com
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Password:</span>
              </p>
              <p className="text-success-green font-mono font-bold bg-white px-3 py-2 rounded-lg">
                Admin@123
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-base text-white">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-success-green hover:text-white font-bold transition-colors underline"
          >
            Create Free Account
          </Link>
        </p>
      </div>
    </div>
  );
}
