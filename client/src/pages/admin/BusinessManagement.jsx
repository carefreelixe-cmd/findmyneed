import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUpload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list"); // list, create, import
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    serviceIds: [],
    suburbIds: [],
  });
  const [services, setServices] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBusinesses();
    fetchServices();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/providers");
      // Handle both array and object responses
      const data = Array.isArray(response.data) ? response.data : response.data.providers || [];
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setBusinesses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/services");
      setServices(response.data.services || response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceSelect = (serviceId) => {
    const id = String(serviceId); // Ensure string comparison
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s) => s !== id)
        : [...prev.serviceIds, id],
    }));
  };

  const handleSubmitBusiness = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare data - ensure IDs are strings or integers
      const submitData = {
        businessName: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        services: formData.serviceIds,
        serviceAreas: formData.suburbIds,
      };

      console.log("Submitting business data:", submitData);

      if (editingId) {
        const response = await axios.put(
          `http://localhost:5000/api/admin/businesses/${editingId}`,
          submitData,
        );
        console.log("Update response:", response);
        alert("Business updated successfully");
      } else {
        const response = await axios.post("http://localhost:5000/api/admin/businesses", submitData);
        console.log("Create response:", response);
        alert("Business created successfully");
      }
      resetForm();
      setActiveTab("list");
      await fetchBusinesses();
    } catch (error) {
      console.error("Error saving business:", error);
      const message = error.response?.data?.message || error.message || "Failed to save business";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBusiness = async (businessId) => {
    try {
      console.log("Fetching business details for:", businessId);
      const response = await axios.get(`http://localhost:5000/api/admin/businesses/${businessId}`);
      console.log("Business details response:", response.data);

      // Handle nested business object
      const business = response.data.business || response.data;

      // Ensure we have arrays for services and suburbs
      const services = Array.isArray(business.services) ? business.services : [];
      const serviceAreas = Array.isArray(business.serviceAreas) ? business.serviceAreas : [];

      setFormData({
        name: business.business_name || business.name || "",
        email: business.email || "",
        phone: business.phone || "",
        description: business.description || "",
        serviceIds: services.map((s) => String(s.id)),
        suburbIds: serviceAreas.map((s) => String(s.id || s.suburb)),
      });
      setEditingId(businessId);
      setActiveTab("create");
    } catch (error) {
      console.error("Error fetching business details:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch business details";
      alert(errorMsg);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("Please select a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split("\n").filter((line) => line.trim());
        const headers = lines[0]
          .toLowerCase()
          .split(",")
          .map((h) => h.trim());

        const data = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            return {
              name: values[headers.indexOf("name")] || "",
              email: values[headers.indexOf("email")] || "",
              phone: values[headers.indexOf("phone")] || "",
              description: values[headers.indexOf("description")] || "",
              serviceIds: (values[headers.indexOf("serviceids")] || "").split(";").filter(Boolean),
              suburbIds: (values[headers.indexOf("suburbids")] || "").split(";").filter(Boolean),
            };
          })
          .filter((item) => item.name && item.email);

        if (data.length === 0) {
          alert("No valid data found in CSV");
          return;
        }

        if (data.length > 500) {
          alert("CSV contains more than 500 records. Maximum allowed is 500.");
          return;
        }

        setImportProgress({ total: data.length, processed: 0, failed: [] });
        const response = await axios.post(
          "http://localhost:5000/api/admin/businesses/bulk-import",
          { businesses: data },
        );

        setImportProgress({
          total: data.length,
          processed: response.data.successful,
          failed: response.data.failed || [],
        });

        alert(
          `Import complete: ${response.data.successful} successful, ${response.data.failed?.length || 0} failed`,
        );
        setCsvFile(null);
        fetchBusinesses();
      } catch (error) {
        console.error("Error during bulk import:", error);
        alert("Failed to import businesses: " + (error.response?.data?.message || error.message));
      }
    };
    reader.readAsText(csvFile);
  };

  const handleDeleteBusiness = async (businessId) => {
    if (
      window.confirm("Are you sure you want to delete this business? This action cannot be undone.")
    ) {
      try {
        setLoading(true);
        console.log("Deleting business:", businessId);
        const response = await axios.delete(
          `http://localhost:5000/api/admin/businesses/${businessId}`,
        );
        console.log("Delete response:", response);
        alert("Business deleted successfully");
        setLoading(false);
        await fetchBusinesses();
      } catch (error) {
        console.error("Error deleting business:", error);
        const errorMsg =
          error.response?.data?.message || error.message || "Failed to delete business";
        alert(errorMsg);
        setLoading(false);
      }
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ["name", "email", "phone", "description", "serviceIds", "suburbIds"];
    const sampleData = [
      [
        "John Plumbing",
        "john@plumbing.com",
        "0412345678",
        "Expert plumbing services",
        "1;2",
        "1;2;3",
      ],
      [
        "Electric Pro",
        "contact@electricpro.com",
        "0412345679",
        "Electrical maintenance",
        "3",
        "1;2",
      ],
    ];

    const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business_import_template.csv";
    a.click();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      description: "",
      serviceIds: [],
      suburbIds: [],
    });
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
        <p className="text-gray-600 mt-2">Manage service providers and assign services/areas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setActiveTab("list");
            resetForm();
          }}
          className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
        >
          Businesses List
        </button>
        <button
          onClick={() => {
            setActiveTab("create");
            resetForm();
          }}
          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === "create" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
        >
          <FaPlus /> {editingId ? "Edit" : "Create"} Business
        </button>
        <button
          onClick={() => {
            setActiveTab("import");
            setCsvFile(null);
          }}
          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === "import" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"}`}
        >
          <FaUpload /> Bulk Import
        </button>
      </div>

      {/* List Tab */}
      {activeTab === "list" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Businesses</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No businesses found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Services
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses && businesses.length > 0 ? (
                      businesses.map((business) => (
                        <tr key={business.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {business.business_name || business.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {business.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {business.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${business.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {business.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {business.services?.length || 0} services
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEditBusiness(business.id)}
                              className="text-blue-600 hover:text-blue-800 mr-4 inline-flex items-center gap-1"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBusiness(business.id)}
                              className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                            >
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No businesses found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? "Edit Business" : "Create New Business"}
          </h2>
          <form onSubmit={handleSubmitBusiness} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!editingId}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Services</label>
              <div className="grid md:grid-cols-2 gap-3">
                {Array.isArray(services) && services.length > 0 ? (
                  services.map((service) => {
                    const serviceId = String(service.id);
                    return (
                      <label
                        key={service.id}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceIds.includes(serviceId)}
                          onChange={() => handleServiceSelect(serviceId)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{service.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No services available</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {editingId ? "Update Business" : "Create Business"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === "import" && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Import Businesses</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Instructions:</strong> Upload a CSV file with up to 500 businesses. Download
              the template below to see the required format.
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={downloadCSVTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
            >
              <FaDownload /> Download CSV Template
            </button>
          </div>

          <form onSubmit={handleBulkImport} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full" />
              {csvFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                  <FaCheckCircle /> {csvFile.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!csvFile || loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <FaUpload /> Import Businesses
            </button>
          </form>

          {importProgress && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Import Results</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-green-600 font-semibold">{importProgress.processed}</span> /{" "}
                  {importProgress.total} businesses imported successfully
                </p>
                {importProgress.failed && importProgress.failed.length > 0 && (
                  <div>
                    <p className="text-sm text-red-600 font-semibold mb-2">
                      {importProgress.failed.length} failed:
                    </p>
                    <ul className="text-xs text-red-600 list-disc list-inside">
                      {importProgress.failed.slice(0, 5).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {importProgress.failed.length > 5 && (
                        <li>... and {importProgress.failed.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
