import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function BannersManager() {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    position: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/features/banners");
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Error loading banners");
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
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/features/banners/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/admin/features/banners", formData);
      }
      alert(editingId ? "Banner updated!" : "Banner created!");
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: "", description: "", imageUrl: "", link: "", position: 0 });
      fetchBanners();
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving banner");
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.image_url || "",
      link: banner.link || "",
      position: banner.position,
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/features/banners/${id}`);
        alert("Banner deleted!");
        fetchBanners();
      } catch (error) {
        console.error("Error:", error);
        alert("Error deleting banner");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold" style={{ color: "#2C3E50" }}>
          Manage Banners
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ title: "", description: "", imageUrl: "", link: "", position: 0 });
              setEditingId(null);
            }
          }}
          className="flex items-center gap-2 text-white px-4 py-2 rounded hover:opacity-90"
          style={{ backgroundColor: "#1B3A5F" }}
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-elevated space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Position</label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="input-field"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Link</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="text-white px-4 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: "#00A86B" }}
            >
              {editingId ? "Update" : "Create"} Banner
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ title: "", description: "", imageUrl: "", link: "", position: 0 });
              }}
              className="text-white px-4 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: "#2C3E50" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="card-elevated text-center py-8 text-gray-600">
          No banners yet. Create one to get started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{banner.title}</td>
                  <td className="px-4 py-3">{banner.position}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${banner.is_active ? "badge-success" : "badge-danger"}`}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="px-3 py-1 rounded text-white hover:opacity-90"
                      style={{ backgroundColor: "#1B3A5F" }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1 rounded text-white hover:opacity-90"
                      style={{ backgroundColor: "#DC3545" }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
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
