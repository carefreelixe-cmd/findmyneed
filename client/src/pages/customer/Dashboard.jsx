import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FaCalendar, FaCheckCircle, FaClock, FaStar, FaTimes, FaComment } from "react-icons/fa";

function DashboardHome() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, completed: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [loadingReview, setLoadingReview] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/customer/bookings");
      setBookings(response.data);

      const pending = response.data.filter((b) => b.status === "pending").length;
      const approved = response.data.filter(
        (b) => b.status === "approved" || b.status === "in_progress",
      ).length;
      const completed = response.data.filter((b) => b.status === "completed").length;

      setStats({ pending, approved, completed });
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.patch(`http://localhost:5000/api/customer/bookings/${id}/cancel`, {
        reason: "Customer cancelled",
      });
      fetchBookings();
      alert("Booking cancelled successfully");
    } catch (error) {
      alert("Error cancelling booking");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) {
      alert("Please enter a review comment");
      return;
    }

    setLoadingReview(true);
    try {
      await axios.post("http://localhost:5000/api/customer/reviews", {
        bookingId: selectedBooking.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      alert("Review submitted successfully!");
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: "" });
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error submitting review";
      alert(errorMsg);
    } finally {
      setLoadingReview(false);
    }
  };

  const filteredBookings =
    filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your bookings and service history</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card-elevated border-l-4 border-l-amber-600 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wider">
                Pending Requests
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
                Active Bookings
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
              <FaStar className="text-3xl text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">My Bookings</h3>
            <p className="text-gray-600 text-sm mt-1">Track and manage all your service bookings</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === "all" ? "bg-blue-600 text-white shadow-md" : "bg-slate-200 text-gray-700 hover:bg-slate-300"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === "pending" ? "bg-blue-600 text-white shadow-md" : "bg-slate-200 text-gray-700 hover:bg-slate-300"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === "approved" ? "bg-blue-600 text-white shadow-md" : "bg-slate-200 text-gray-700 hover:bg-slate-300"}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === "completed" ? "bg-blue-600 text-white shadow-md" : "bg-slate-200 text-gray-700 hover:bg-slate-300"}`}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center">
            <FaCalendar className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-slate-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900">{booking.service_name}</h4>
                    <p className="text-sm text-gray-600">📍 {booking.provider_name}</p>
                  </div>
                  <span
                    className={`status-badge ${
                      booking.status === "completed"
                        ? "status-completed"
                        : booking.status === "confirmed"
                          ? "status-approved"
                          : booking.status === "in_progress"
                            ? "status-in-progress"
                            : booking.status === "pending"
                              ? "status-pending"
                              : "status-cancelled"
                    }`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-gray-600 font-semibold text-xs uppercase">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-gray-600 font-semibold text-xs uppercase">Location</p>
                    <p className="font-semibold text-gray-900">{booking.suburb}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-gray-600 font-semibold text-xs uppercase">Phone</p>
                    <p className="font-semibold text-gray-900">{booking.provider_phone || "N/A"}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-600 font-semibold text-xs uppercase">Total Price</p>
                    <p className="font-bold text-blue-600 text-lg">${booking.total_price}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                  {booking.status === "completed" && !booking.review_id && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowReviewForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
                    >
                      <FaComment /> Leave Review
                    </button>
                  )}
                  {booking.status === "completed" && booking.review_id && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
                      <FaCheckCircle /> Review Submitted ({booking.review_rating}{" "}
                      <FaStar className="inline text-yellow-500" />)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
            <p className="text-gray-600 mb-4">
              Service: <strong>{selectedBooking.service_name}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-3xl transition ${star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this service..."
                  className="input-field"
                  rows="4"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loadingReview}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loadingReview ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboard() {
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
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#00A86B" }}
                >
                  <FaCalendar className="text-white text-lg" />
                </div>
                <div className="text-2xl font-bold text-white">ServiceHub</div>
              </div>
              <div className="flex gap-1">
                <Link
                  to="/customer"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/search"
                  className="nav-link px-3 py-2 rounded-lg hover:opacity-80 text-white"
                >
                  Find Services
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<DashboardHome />} />
        </Routes>
      </div>
    </div>
  );
}
