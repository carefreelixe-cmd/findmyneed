import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiPhone,
  FiBriefcase,
  FiHome,
} from "react-icons/fi";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      if (formData.role === "provider") {
        alert("Registration successful! Your account is pending admin approval.");
      }

      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 168, 107, 0.9), rgba(27, 58, 95, 0.88)), url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=1080&fit=crop)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white hover:text-brand-white transition-colors mb-4 text-sm font-medium"
        >
          <FiHome className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white to-gray-100 rounded-2xl mb-2 sm:mb-3 shadow-2xl">
            <FiBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-success-green" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
            Join ServiceHub
          </h1>
          <p className="text-gray-100 text-sm sm:text-base">Create your free account today</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-alert-red rounded-lg flex items-start gap-3">
            <div className="text-alert-red mt-0.5 flex-shrink-0">
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 md:p-6 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Account Type */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-brand-charcoal mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <label
                  className={`flex flex-col items-center p-4 border-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                    formData.role === "customer"
                      ? "border-success-green bg-green-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-success-green hover:shadow-md"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{
                      backgroundColor: formData.role === "customer" ? "#00A86B" : "#f3f4f6",
                    }}
                  >
                    <FiUser
                      className={`w-6 h-6 ${formData.role === "customer" ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === "customer"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span
                    className={`font-bold text-base ${formData.role === "customer" ? "text-success-green" : "text-brand-charcoal"}`}
                  >
                    Find Services
                  </span>
                  <span className="text-xs text-gray-600 mt-1">Book providers</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 border-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                    formData.role === "provider"
                      ? "border-success-green bg-green-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-success-green hover:shadow-md"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{
                      backgroundColor: formData.role === "provider" ? "#00A86B" : "#f3f4f6",
                    }}
                  >
                    <FiBriefcase
                      className={`w-6 h-6 ${formData.role === "provider" ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="provider"
                    checked={formData.role === "provider"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span
                    className={`font-bold text-base ${formData.role === "provider" ? "text-success-green" : "text-brand-charcoal"}`}
                  >
                    Offer Services
                  </span>
                  <span className="text-xs text-gray-600 mt-1">Grow business</span>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs sm:text-sm font-bold text-brand-charcoal mb-1 sm:mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                    required
                    disabled={loading}
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-bold text-brand-charcoal mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                    required
                    disabled={loading}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                    required
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-brand-charcoal mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                    required
                    placeholder="+1 (555) 000-0000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-brand-charcoal mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-green focus:border-success-green outline-none transition-all bg-white"
                    required
                    placeholder="Re-enter password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#00A86B" }}
              className="w-full text-white font-bold py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 mt-3 sm:mt-4"
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
                  Creating Account...
                </span>
              ) : (
                `Create ${formData.role === "provider" ? "Provider" : "Customer"} Account`
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white hover:text-success-green font-bold transition-colors underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
