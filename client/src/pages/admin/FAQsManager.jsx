import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function FAQsManager() {
  const [faqs, setFaqs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/features/faqs");
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      alert("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question || !formData.answer) {
      alert("Question and Answer are required");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/features/faqs/${editingId}`, formData);
        alert("FAQ updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/admin/features/faqs", formData);
        alert("FAQ created successfully");
      }

      setFormData({
        question: "",
        answer: "",
        category: "",
        displayOrder: 0,
        isActive: true,
      });
      setEditingId(null);
      setShowForm(false);
      fetchFAQs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert("Failed to save FAQ");
    }
  };

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      displayOrder: faq.display_order || 0,
      isActive: faq.is_active,
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/features/faqs/${id}`);
        alert("FAQ deleted successfully");
        fetchFAQs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        alert("Failed to delete FAQ");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading FAQs...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
          FAQs Management
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              question: "",
              answer: "",
              category: "",
              displayOrder: 0,
              isActive: true,
            });
          }}
          className="text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#1B3A5F" }}
        >
          <FaPlus /> Add FAQ
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit FAQ" : "Add New FAQ"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question *</label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Enter FAQ question"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Answer *</label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                placeholder="Enter FAQ answer"
                rows="4"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., General, Billing, Services"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label className="ml-2 text-sm font-medium">Active</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: "#00A86B" }}
              >
                {editingId ? "Update" : "Create"} FAQ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: "#2C3E50" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Question</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-center">Order</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.length === 0 ? (
              <tr>
                <td colSpan="5" className="border p-4 text-center text-gray-500">
                  No FAQs found
                </td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <div className="font-medium">{faq.question}</div>
                    <div className="text-sm text-gray-600 truncate">{faq.answer}</div>
                  </td>
                  <td className="border p-2">{faq.category || "-"}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        faq.is_active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                      }`}
                    >
                      {faq.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="border p-2 text-center">{faq.display_order || 0}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FAQsManager;
