import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  FaCalendar,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaThumbsUp,
  FaExclamationCircle,
  FaStore,
} from "react-icons/fa";

// ========== DASHBOARD HOME ==========
function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, approved: 0, completed: 0, rating: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, reviewsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/provider/bookings"),
        axios.get("http://localhost:5000/api/provider/reviews"),
      ]);

      const bookings = bookingsRes.data;
      const reviews = reviewsRes.data;

      setStats({
        pending: bookings.filter((b) => b.status === "pending").length,
        approved: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        rating:
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0,
      });

      setRecentBookings(bookings.slice(0, 5));
      setRecentReviews(reviews.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Service Provider Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.firstName}! Manage your services and bookings
        </p>
      </div>

      {!user?.isApproved && (
        <div className="alert alert-warning">
          <FaExclamationCircle className="text-xl flex-shrink-0 mt-0.5" />
          <span>
            <strong>Pending Approval</strong> - Your account is under review. Once approved by
            admin, you'll be able to receive bookings.
          </span>
        </div>
      )}

      {user?.isApproved && (
        <div className="alert alert-success">
          <FaCheckCircle className="text-xl flex-shrink-0 mt-0.5" />
          <span>
            <strong>Account Approved!</strong> Your account is active. You can now accept bookings
            and manage services.
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card-elevated border-l-4 border-l-amber-600 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wider">
                Pending
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <FaClock className="text-3xl text-white" />
            </div>
          </div>
        </div>

        <div className="card-elevated border-l-4 border-l-blue-600 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wider">
                Approved
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.approved}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-3xl text-white" />
            </div>
          </div>
        </div>

        <div className="card-elevated border-l-4 border-l-teal-600 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wider">
                Completed
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.completed}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <FaCalendar className="text-3xl text-white" />
            </div>
          </div>
        </div>

        <div className="card-elevated border-l-4 border-l-yellow-600 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wider">
                Your Rating
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.rating}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <FaStar className="text-3xl text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings and Reviews */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaCalendar className="text-blue-600" /> Recent Bookings
          </h3>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{booking.customer_name}</p>
                      <p className="text-sm text-gray-600">{booking.service_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        booking.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Recent Reviews
          </h3>
          {recentReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {review.first_name} {review.last_name}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                            size={12}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  {review.provider_response && (
                    <div className="mt-2 bg-blue-50 border-l-2 border-blue-400 p-2">
                      <p className="text-xs font-medium text-blue-800">Your Response:</p>
                      <p className="text-xs text-blue-700 line-clamp-1">
                        {review.provider_response}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== PROFILE MANAGEMENT ==========
function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    address: "",
    suburb: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Australia",
    specialties: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/provider/profile");
      setProfile(response.data);

      // Handle specialties - convert array to comma-separated string if needed
      const specialties = Array.isArray(response.data.specialties)
        ? response.data.specialties.join(", ")
        : response.data.specialties || "";

      setFormData({
        businessName: response.data.business_name || "",
        businessDescription: response.data.business_description || "",
        address: response.data.address || "",
        suburb: response.data.suburb || "",
        city: response.data.city || "",
        state: response.data.state || "",
        postalCode: response.data.postal_code || "",
        country: response.data.country || "Australia",
        specialties: specialties,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else if (error.response?.status === 404) {
        alert("Profile not found. Please complete your profile setup.");
      } else {
        alert("Could not load profile: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.patch("http://localhost:5000/api/provider/profile", formData);
      alert("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600 mt-1">Manage your business information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="card-elevated space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Business Name
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.business_name || "Not specified"}
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Contact Phone
              </h3>
              <p className="text-2xl font-bold text-gray-900">{user?.phone || "Not specified"}</p>
            </div>

            <div className="md:col-span-2 border-l-4 border-teal-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Business Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {profile?.business_description || "Not specified"}
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Address
              </h3>
              <p className="text-gray-700">{profile?.address || "Not specified"}</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Suburb
              </h3>
              <p className="text-gray-700">{profile?.suburb || "Not specified"}</p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                City
              </h3>
              <p className="text-gray-700">{profile?.city || "Not specified"}</p>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                State
              </h3>
              <p className="text-gray-700">{profile?.state || "Not specified"}</p>
            </div>

            <div className="border-l-4 border-rose-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Postal Code
              </h3>
              <p className="text-gray-700">{profile?.postal_code || "Not specified"}</p>
            </div>

            <div className="md:col-span-2 border-l-4 border-indigo-500 pl-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.specialties ? (
                  Array.isArray(profile.specialties) ? (
                    profile.specialties.map((spec, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {spec}
                      </span>
                    ))
                  ) : (
                    profile.specialties.split(",").map((spec, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {spec.trim()}
                      </span>
                    ))
                  )
                ) : (
                  <p className="text-gray-500">Not specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-elevated space-y-6">
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business Description</label>
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleInputChange}
              rows="4"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Suburb</label>
              <input
                type="text"
                name="suburb"
                value={formData.suburb}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Specialties (comma-separated)</label>
            <input
              type="text"
              name="specialties"
              value={formData.specialties}
              onChange={handleInputChange}
              placeholder="e.g., Plumbing, Gas Fitting, Maintenance"
              className="input-field"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ========== SERVICES MANAGEMENT ==========
function Services() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    categoryId: "",
    serviceAreas: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/provider/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Could not load services");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/customer/categories");
      console.log("Categories loaded:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Don't alert user, just log the error
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      categoryId: "",
      serviceAreas: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert("Service name is required");
        return;
      }
      if (!formData.categoryId) {
        alert("Category is required");
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert("Price is required and must be greater than 0");
        return;
      }

      console.log("Submitting form data:", formData);

      if (editingId) {
        const response = await axios.patch(
          `http://localhost:5000/api/provider/services/${editingId}`,
          formData,
        );
        console.log("Service updated:", response.data);
        alert("Service updated successfully!");
      } else {
        const response = await axios.post("http://localhost:5000/api/provider/services", formData);
        console.log("Service created:", response.data);
        alert("Service created successfully!");
      }
      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || error.message;
      alert("Error: " + errorMessage);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      categoryId: service.category_id,
      serviceAreas: service.service_areas || "",
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/provider/services/${id}`);
      alert("Service deleted successfully!");
      fetchServices();
    } catch (error) {
      alert("Error deleting service: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading services...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <FaPlus /> Add Service
          </button>
        )}
      </div>

      {showForm && (
        <div className="card-elevated">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">
            {editingId ? "Edit Service" : "Create New Service"}
          </h3>

          {categories.length === 0 && (
            <div className="alert alert-warning mb-6">
              Loading categories... If this persists, ensure admin has created service categories.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Areas</label>
                <input
                  type="text"
                  name="serviceAreas"
                  value={formData.serviceAreas}
                  onChange={handleInputChange}
                  placeholder="e.g., Sydney, Melbourne"
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="input-field"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button type="submit" className="btn-primary">
                {editingId ? "Update Service" : "Create Service"}
              </button>
              <button type="button" onClick={resetForm} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <p className="text-gray-500 mb-4">
            No services yet. Create your first service to get started!
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create Service
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="card-elevated card-hover">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900 flex-1">{service.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <p className="text-teal-600 text-sm mb-2 font-medium">{service.category_name}</p>
              <p className="text-2xl font-bold text-orange-600 mb-3">
                ${Number(service.price).toFixed(2)}
              </p>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{service.description}</p>

              {service.duration && (
                <p className="text-sm text-gray-600 mb-2">⏱️ {service.duration} minutes</p>
              )}
              {service.service_areas && (
                <p className="text-sm text-gray-600 mb-2">📍 {service.service_areas}</p>
              )}

              <div className="pt-4 border-t border-slate-200">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    service.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {service.is_active ? "✓ Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== BOOKINGS MANAGEMENT ==========
function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url =
        filterStatus === "all"
          ? "http://localhost:5000/api/provider/bookings"
          : `http://localhost:5000/api/provider/bookings?status=${filterStatus}`;
      const response = await axios.get(url);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/provider/bookings/${id}/status`, {
        status: newStatus,
      });
      alert("Booking status updated!");
      fetchBookings();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const statuses = [
    { value: "all", label: "All Bookings" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ];

  if (loading) return <div className="p-6 text-center">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="text-gray-600 mt-1">Review and manage your service bookings</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilterStatus(status.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status.value
                ? "btn-primary"
                : "bg-white border border-slate-300 text-gray-700 hover:bg-slate-50"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <p className="text-gray-500">No bookings found in this status</p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-600">{booking.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{booking.service_name}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString()}{" "}
                      {booking.booking_time && `@ ${booking.booking_time}`}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{booking.customer_phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "in_progress"
                                ? "bg-purple-100 text-purple-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                            className="btn-success text-sm py-1"
                            title="Accept booking"
                          >
                            <FaThumbsUp className="inline mr-1" /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, "rejected")}
                            className="btn-danger text-sm py-1"
                            title="Reject booking"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, "in_progress")}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition"
                          title="Start work"
                        >
                          Start Work
                        </button>
                      )}
                      {booking.status === "in_progress" && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, "completed")}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                          title="Mark as complete"
                        >
                          ✓ Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== REVIEWS & RATINGS ==========
function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [expandedReview, setExpandedReview] = useState(null);
  const [responseText, setResponseText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/provider/reviews");
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId) => {
    const response = responseText[reviewId];
    if (!response?.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/provider/reviews/${reviewId}/respond`, {
        response,
      });
      alert("Response added!");
      setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
      setExpandedReview(null);
      fetchReviews();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading reviews...</div>;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Reviews & Ratings</h1>
        <p className="text-gray-600 mt-1">Manage customer feedback and responses</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card-elevated border-l-4 border-yellow-500">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Average Rating
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-yellow-500">{avgRating}</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"}
                  size={18}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card-elevated border-l-4 border-blue-500">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Total Reviews
          </h3>
          <p className="text-4xl font-bold text-blue-600">{reviews.length}</p>
        </div>

        <div className="card-elevated border-l-4 border-green-500">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Responded
          </h3>
          <p className="text-4xl font-bold text-green-600">
            {reviews.filter((r) => r.provider_response).length}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <FaStar className="mx-auto text-gray-300 text-5xl mb-4" />
          <p className="text-gray-500 text-lg">No reviews yet. Delight customers to get reviews!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card-elevated card-hover">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-lg text-gray-900">
                    {review.first_name} {review.last_name}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                        size={16}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {review.provider_response ? (
                <div className="alert alert-info">
                  <p className="text-sm font-semibold mb-1">Your Response:</p>
                  <p className="text-sm">{review.provider_response}</p>
                  <p className="text-xs mt-2">
                    {new Date(review.provider_responded_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <>
                  {expandedReview === review.id ? (
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <textarea
                        value={responseText[review.id] || ""}
                        onChange={(e) =>
                          setResponseText((prev) => ({ ...prev, [review.id]: e.target.value }))
                        }
                        placeholder="Share your response to this review..."
                        rows="3"
                        className="input-field mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(review.id)}
                          className="btn-primary text-sm"
                        >
                          Post Response
                        </button>
                        <button
                          onClick={() => setExpandedReview(null)}
                          className="btn-ghost text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedReview(review.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2 transition"
                    >
                      <FaEdit /> Respond to Review
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== MAIN PROVIDER DASHBOARD ==========
export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-dashboard provider-dashboard min-h-screen">
      {/* Navigation Bar */}
      <nav className="dashboard-topbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex gap-8 items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                  style={{ backgroundColor: "#00A86B" }}
                >
                  <FaStore className="text-white text-lg" />
                </div>
                <div className="text-2xl font-bold text-white">FindMyNeed Pro</div>
              </div>
              <div className="hidden md:flex gap-1">
                <Link
                  to="/provider"
                  className="nav-link px-3 py-2 rounded-lg transition hover:opacity-80 text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/provider/profile"
                  className="nav-link px-3 py-2 rounded-lg transition hover:opacity-80 text-white"
                >
                  Profile
                </Link>
                <Link
                  to="/provider/services"
                  className="nav-link px-3 py-2 rounded-lg transition hover:opacity-80 text-white"
                >
                  Services
                </Link>
                <Link
                  to="/provider/bookings"
                  className="nav-link px-3 py-2 rounded-lg transition hover:opacity-80 text-white"
                >
                  Bookings
                </Link>
                <Link
                  to="/provider/reviews"
                  className="nav-link px-3 py-2 rounded-lg transition hover:opacity-80 text-white"
                >
                  Reviews
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-right">
                <p className="font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs opacity-70 text-white">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{ backgroundColor: "#DC3545" }}
                className="btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
          <Link to="/provider" className="nav-link px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            Dashboard
          </Link>
          <Link
            to="/provider/profile"
            className="nav-link px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            Profile
          </Link>
          <Link
            to="/provider/services"
            className="nav-link px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            Services
          </Link>
          <Link
            to="/provider/bookings"
            className="nav-link px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            Bookings
          </Link>
          <Link
            to="/provider/reviews"
            className="nav-link px-3 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            Reviews
          </Link>
        </div>
      </div>

      <div className="dashboard-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="services" element={<Services />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="reviews" element={<Reviews />} />
        </Routes>
      </div>
    </div>
  );
}
