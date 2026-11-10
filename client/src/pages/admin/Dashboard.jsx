import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  FaUsers,
  FaStore,
  FaCalendar,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaChartBar,
  FaFileAlt,
  FaCog,
  FaLock,
  FaComments,
} from "react-icons/fa";
import BusinessManagement from "./BusinessManagement";
import ErrorBoundary from "./ErrorBoundary";
import AdminFeaturesMenu from "./AdminFeaturesMenu";
import BannersManager from "./BannersManager";
import FAQsManager from "./FAQsManager";
import PagesManager from "./PagesManager";
import CommissionsManager from "./CommissionsManager";
import NotificationsManager from "./NotificationsManager";
import BlogPostsManager from "./BlogPostsManager";

function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the admin control panel. Manage providers, customers, and bookings.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div
          className="card-elevated border-l-4 hover:shadow-xl"
          style={{ borderLeftColor: "#1B3A5F", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-semibold text-sm uppercase tracking-wider"
                style={{ color: "#2C3E50" }}
              >
                Total Providers
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {stats?.stats.total_providers || 0}
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1B3A5F" }}
            >
              <FaStore className="text-3xl text-white" />
            </div>
          </div>
        </div>

        <div
          className="card-elevated border-l-4 hover:shadow-xl"
          style={{ borderLeftColor: "#00A86B", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-semibold text-sm uppercase tracking-wider"
                style={{ color: "#2C3E50" }}
              >
                Total Customers
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {stats?.stats.total_customers || 0}
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#00A86B" }}
            >
              <FaUsers className="text-3xl text-white" />
            </div>
          </div>
        </div>

        <div
          className="card-elevated border-l-4 hover:shadow-xl"
          style={{ borderLeftColor: "#F5A623", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-semibold text-sm uppercase tracking-wider"
                style={{ color: "#2C3E50" }}
              >
                Total Bookings
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {stats?.stats.total_bookings || 0}
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F5A623" }}
            >
              <FaCalendar className="text-3xl text-white" />
            </div>
          </div>
        </div>

        <div
          className="card-elevated border-l-4 hover:shadow-xl"
          style={{ borderLeftColor: "#DC3545", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-semibold text-sm uppercase tracking-wider"
                style={{ color: "#2C3E50" }}
              >
                Pending Approvals
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {stats?.stats.pending_approvals || 0}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <FaClock className="text-3xl text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-6">
            <FaCalendar className="text-blue-600 text-xl" />
            <h3 className="text-2xl font-bold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="space-y-3">
            {stats?.recentBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{booking.service_name}</p>
                  <p className="text-sm text-gray-600">
                    {booking.customer_name} → {booking.provider_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${booking.total_price}</p>
                  <span
                    className={`status-badge ${booking.status === "completed" ? "status-completed" : booking.status === "confirmed" ? "status-approved" : "status-pending"}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-6">
            <FaStar className="text-teal-600 text-xl" />
            <h3 className="text-2xl font-bold text-gray-900">Top Rated Providers</h3>
          </div>
          <div className="space-y-3">
            {stats?.topProviders.slice(0, 5).map((provider) => (
              <div
                key={provider.id}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{provider.business_name}</p>
                  <p className="text-sm text-gray-600">{provider.total_reviews} reviews</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 font-semibold text-amber-600">
                    <FaStar className="text-sm" /> {provider.rating || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProviders();
  }, [filter]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/providers?status=${filter}`,
      );
      setProviders(response.data.providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, isApproved) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/providers/${id}/status`, { isApproved });
      fetchProviders();
      alert(`Provider ${isApproved ? "approved" : "rejected"} successfully`);
    } catch (error) {
      alert("Error updating provider status");
    }
  };

  const handleDeactivate = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/providers/${id}/deactivate`, {
        isActive: !isActive,
      });
      fetchProviders();
      alert(`Provider ${!isActive ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      alert("Error updating provider status");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Providers</h1>

      <div className="mb-6 flex gap-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "btn-primary" : "btn-secondary"}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={filter === "pending" ? "btn-primary" : "btn-secondary"}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={filter === "approved" ? "btn-primary" : "btn-secondary"}
        >
          Approved
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Suburb
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td className="px-6 py-4 font-medium">{provider.business_name}</td>
                  <td className="px-6 py-4">{provider.email}</td>
                  <td className="px-6 py-4">{provider.suburb || "N/A"}</td>
                  <td className="px-6 py-4">{provider.rating || 0} ⭐</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        provider.is_approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {provider.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        provider.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {provider.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {!provider.is_approved && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(provider.id, true)}
                            className="text-white px-3 py-1 rounded text-sm hover:opacity-90"
                            style={{ backgroundColor: "#00A86B" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(provider.id, false)}
                            className="text-white px-3 py-1 rounded text-sm hover:opacity-90"
                            style={{ backgroundColor: "#DC3545" }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeactivate(provider.id, provider.is_active)}
                        className="text-white px-3 py-1 rounded text-sm hover:opacity-90"
                        style={{ backgroundColor: provider.is_active ? "#DC3545" : "#00A86B" }}
                      >
                        {provider.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{analytics?.totalBookings || 0}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <FaCalendar className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Bookings</p>
              <p className="text-2xl font-bold">{analytics?.completedBookings || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Success rate</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="card bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${analytics?.totalRevenue || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Commission: ${analytics?.totalCommission || 0}
              </p>
            </div>
            <FaChartBar className="text-3xl text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Bookings by Suburb</h3>
          <div className="space-y-2">
            {analytics?.bookingsBySuburb?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">{item.suburb}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / (analytics.bookingsBySuburb[0]?.count || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Top Services</h3>
          <div className="space-y-2">
            {analytics?.topServices?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">{item.service_name}</span>
                <span className="text-sm font-medium">{item.bookings} bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-xl font-semibold mb-4">Most Viewed Providers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reviews
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics?.mostViewedProviders?.map((provider) => (
                <tr key={provider.id}>
                  <td className="px-6 py-4">{provider.business_name}</td>
                  <td className="px-6 py-4">{provider.rating} ⭐</td>
                  <td className="px-6 py-4">{provider.total_bookings}</td>
                  <td className="px-6 py-4">{provider.total_reviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/categories", formData);
      setFormData({ name: "", description: "" });
      setShowForm(false);
      fetchCategories();
      alert("Category added successfully");
    } catch (error) {
      alert("Error adding category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/categories/${id}`);
        fetchCategories();
        alert("Category deleted successfully");
      } catch (error) {
        alert("Error deleting category");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
              ></textarea>
            </div>
            <button type="submit" className="btn-primary">
              Add Category
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-gray-600">{category.description || "N/A"}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="btn-danger text-sm px-3 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">No categories found</div>
          )}
        </div>
      )}
    </div>
  );
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/customers");
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id, isActive) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/customers/${id}/status`, {
        isActive: !isActive,
      });
      fetchCustomers();
      alert(`Customer ${!isActive ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      alert("Error updating customer status");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Customers</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 font-medium">
                    {customer.first_name} {customer.last_name}
                  </td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.total_bookings || 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        customer.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeactivate(customer.id, customer.is_active)}
                      className={`text-sm px-3 py-1 rounded ${
                        customer.is_active ? "btn-danger" : "bg-green-600 text-white"
                      }`}
                    >
                      {customer.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
}

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/reviews");
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/reviews/${id}`);
        fetchReviews();
        alert("Review deleted successfully");
      } catch (error) {
        alert("Error deleting review");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Reviews & Ratings</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4">{review.customer_name}</td>
                  <td className="px-6 py-4">{review.provider_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span>{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {review.comment?.substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="btn-danger text-sm px-3 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">No reviews found</div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setError(null);
      const response = await axios.get("http://localhost:5000/api/admin/activity-logs");
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError(error.response?.data?.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchLogs} className="text-sm underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div>Loading activity logs...</div>
          <div className="text-sm text-gray-600 mt-2">
            This is the first time, so there may be no logs yet.
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entity Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 font-medium">
                      {log.action.replace("_", " ").toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">{log.entity_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.details || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No activity logs found. Logs will appear here as admin actions are performed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const url =
        filter === "all"
          ? "http://localhost:5000/api/admin/bookings"
          : `http://localhost:5000/api/admin/bookings?status=${filter}`;
      const response = await axios.get(url);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        status: newStatus,
      });
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
      alert("Booking status updated successfully");
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "btn-primary" : "btn-secondary"}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={filter === "pending" ? "btn-primary" : "btn-secondary"}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={filter === "approved" ? "btn-primary" : "btn-secondary"}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={filter === "in_progress" ? "btn-primary" : "btn-secondary"}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={filter === "completed" ? "btn-primary" : "btn-secondary"}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={filter === "rejected" ? "btn-primary" : "btn-secondary"}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 text-sm">{booking.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{booking.customer_name}</div>
                      <div className="text-sm text-gray-600">{booking.customer_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{booking.provider_name || "N/A"}</td>
                  <td className="px-6 py-4">{booking.service_name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(booking.booking_date)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className="px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 font-medium">${booking.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">No bookings found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <nav className="shadow-md sticky top-0 z-40" style={{ backgroundColor: "#1B3A5F" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#00A86B" }}
                >
                  <FaCog className="text-white text-lg" />
                </div>
                <div className="text-2xl font-bold text-white">Admin</div>
              </div>
              <div className="hidden md:flex gap-1">
                <Link
                  to="/admin"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaChartBar className="inline mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/businesses"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaStore className="inline mr-2" />
                  Businesses
                </Link>
                <Link
                  to="/admin/providers"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaStore className="inline mr-2" />
                  Providers
                </Link>
                <Link
                  to="/admin/customers"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaUsers className="inline mr-2" />
                  Customers
                </Link>
                <Link
                  to="/admin/bookings"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaCalendar className="inline mr-2" />
                  Bookings
                </Link>
                <Link
                  to="/admin/categories"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaFileAlt className="inline mr-2" />
                  Categories
                </Link>
                <Link
                  to="/admin/reviews"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaComments className="inline mr-2" />
                  Reviews
                </Link>
                <Link
                  to="/admin/features"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  <FaCog className="inline mr-2" />
                  Features
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded text-white hover:opacity-80"
              style={{ backgroundColor: "#DC3545" }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="businesses" element={<BusinessManagement />} />
            <Route path="providers" element={<Providers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="features" element={<AdminFeaturesMenu />} />
            <Route path="banners" element={<BannersManager />} />
            <Route path="faqs" element={<FAQsManager />} />
            <Route path="pages" element={<PagesManager />} />
            <Route path="commissions" element={<CommissionsManager />} />
            <Route path="notifications" element={<NotificationsManager />} />
            <Route path="blog" element={<BlogPostsManager />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}
