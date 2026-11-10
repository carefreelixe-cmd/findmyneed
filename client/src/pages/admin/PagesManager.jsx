import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa";

function PagesManager() {
  const [pages, setPages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isPublished: false,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/features/pages");
      setPages(response.data);
    } catch (error) {
      console.error("Error fetching pages:", error);
      alert("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    // Auto-generate slug from title if editing title
    if (name === "title" && !editingId) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: slug,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      alert("Title, Slug, and Content are required");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/features/pages/${editingId}`, formData);
        alert("Page updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/admin/features/pages", formData);
        alert("Page created successfully");
      }

      setFormData({
        title: "",
        slug: "",
        content: "",
        isPublished: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchPages();
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Failed to save page");
    }
  };

  const handleEdit = (page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.is_published,
    });
    setEditingId(page.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/features/pages/${id}`);
        alert("Page deleted successfully");
        fetchPages();
      } catch (error) {
        console.error("Error deleting page:", error);
        alert("Failed to delete page");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading pages...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
          Pages Management
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: "",
              slug: "",
              content: "",
              isPublished: false,
            });
          }}
          className="text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#1B3A5F" }}
        >
          <FaPlus /> Add Page
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Page" : "Add New Page"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter page title"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Page Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="Enter page slug (URL-friendly)"
                className="w-full px-3 py-2 border rounded"
                required
              />
              <small className="text-gray-500">Auto-generated from title, or set manually</small>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter page content (HTML supported)"
                rows="8"
                className="w-full px-3 py-2 border rounded font-mono text-sm"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label className="ml-2 text-sm font-medium">Publish Page</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: "#00A86B" }}
              >
                {editingId ? "Update" : "Create"} Page
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
              <th className="border p-2 text-left">Title</th>
              <th className="border p-2 text-left">Slug</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan="4" className="border p-4 text-center text-gray-500">
                  No pages found
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{page.title}</td>
                  <td className="border p-2 text-sm text-gray-600">{page.slug}</td>
                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        page.is_published
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
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

export default PagesManager;
