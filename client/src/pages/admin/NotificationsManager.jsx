import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaPaperPlane } from "react-icons/fa";

function NotificationsManager() {
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notificationType: "email",
    recipientType: "all",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/features/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      alert("Title and Message are required");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/admin/features/notifications", formData);
      alert("Notification sent successfully");

      setFormData({
        title: "",
        message: "",
        notificationType: "email",
        recipientType: "all",
      });
      setShowForm(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/features/notifications/${id}`);
        alert("Notification deleted successfully");
        fetchNotifications();
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Failed to delete notification");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading notifications...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
          System Notifications
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#1B3A5F" }}
        >
          <FaPaperPlane /> Send Notification
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Send New Notification</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Notification Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notification title"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter notification message"
                rows="4"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Notification Type *</label>
                <select
                  name="notificationType"
                  value={formData.notificationType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in_app">In-App</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Send To *</label>
                <select
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="all">All Users</option>
                  <option value="providers">Service Providers Only</option>
                  <option value="customers">Customers Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: "#00A86B" }}
              >
                <FaPaperPlane /> Send Notification
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: "#2C3E50" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Sent Notifications</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded">
              No notifications sent yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-50 p-4 rounded border border-gray-200 hover:border-gray-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {notification.notification_type === "email" && "📧 Email"}
                        {notification.notification_type === "sms" && "📱 SMS"}
                        {notification.notification_type === "in_app" && "🔔 In-App"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {notification.recipient_type === "all" && "👥 All Users"}
                        {notification.recipient_type === "providers" && "🏪 Providers"}
                        {notification.recipient_type === "customers" && "👤 Customers"}
                      </span>
                      {notification.is_sent && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          ✓ Sent
                        </span>
                      )}
                    </div>
                    {notification.sent_at && (
                      <div className="text-xs text-gray-500 mt-2">
                        Sent: {new Date(notification.sent_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsManager;
