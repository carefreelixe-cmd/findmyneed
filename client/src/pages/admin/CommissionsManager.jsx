import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function CommissionsManager() {
  const [commissions, setCommissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    commissionType: "percentage",
    amount: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/features/commissions");
      setCommissions(response.data);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      alert("Failed to fetch commissions");
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

    if (!formData.name || !formData.amount) {
      alert("Name and Amount are required");
      return;
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/admin/features/commissions/${editingId}`,
          submitData,
        );
        alert("Commission updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/admin/features/commissions", submitData);
        alert("Commission created successfully");
      }

      setFormData({
        name: "",
        commissionType: "percentage",
        amount: "",
        description: "",
        isActive: true,
      });
      setEditingId(null);
      setShowForm(false);
      fetchCommissions();
    } catch (error) {
      console.error("Error saving commission:", error);
      alert("Failed to save commission");
    }
  };

  const handleEdit = (commission) => {
    setFormData({
      name: commission.name,
      commissionType: commission.commission_type,
      amount: commission.amount.toString(),
      description: commission.description || "",
      isActive: commission.is_active,
    });
    setEditingId(commission.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this commission?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/features/commissions/${id}`);
        alert("Commission deleted successfully");
        fetchCommissions();
      } catch (error) {
        console.error("Error deleting commission:", error);
        alert("Failed to delete commission");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading commissions...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
          Commissions & Fees Management
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              commissionType: "percentage",
              amount: "",
              description: "",
              isActive: true,
            });
          }}
          className="text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#1B3A5F" }}
        >
          <FaPlus /> Add Commission
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Commission" : "Add New Commission"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commission Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Platform Commission, Service Fee"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  name="commissionType"
                  value={formData.commissionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder={formData.commissionType === "percentage" ? "0-100" : "0.00"}
                  step={formData.commissionType === "percentage" ? "0.1" : "0.01"}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <small className="text-gray-500">
                  {formData.commissionType === "percentage"
                    ? "Enter percentage (0-100)"
                    : "Enter amount in dollars"}
                </small>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this commission/fee"
                rows="3"
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
                {editingId ? "Update" : "Create"} Commission
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
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-center">Type</th>
              <th className="border p-2 text-right">Amount</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commissions.length === 0 ? (
              <tr>
                <td colSpan="5" className="border p-4 text-center text-gray-500">
                  No commissions found
                </td>
              </tr>
            ) : (
              commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <div className="font-medium">{commission.name}</div>
                    {commission.description && (
                      <div className="text-sm text-gray-600">{commission.description}</div>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {commission.commission_type === "percentage" ? "%" : "$"}
                    </span>
                  </td>
                  <td className="border p-2 text-right font-mono">
                    {commission.commission_type === "percentage"
                      ? `${commission.amount}%`
                      : `$${commission.amount.toFixed(2)}`}
                  </td>
                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        commission.is_active
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {commission.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleEdit(commission)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(commission.id)}
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

export default CommissionsManager;
