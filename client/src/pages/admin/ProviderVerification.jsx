import { useState, useEffect } from "react";
import axios from "axios";

const ProviderVerification = () => {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDocs, setProviderDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/documents/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingDocs(response.data.documents || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderDocuments = async (providerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/admin/providers/${providerId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProviderDocs(response.data.documents || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch provider documents");
    }
  };

  const verifyDocument = async (documentId, isVerified, rejectionReason = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/admin/documents/${documentId}/verify`,
        { isVerified, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchPendingDocuments();
      if (selectedProvider) {
        fetchProviderDocuments(selectedProvider);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify document");
    }
  };

  const handleReject = (documentId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      verifyDocument(documentId, false, reason);
    }
  };

  const viewProviderDetails = (providerId) => {
    setSelectedProvider(providerId);
    fetchProviderDocuments(providerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Provider Verification</h1>
        <p className="text-gray-600">Review and verify provider documents for KYC compliance</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Pending Documents Count */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Pending Verification</p>
            <p className="text-4xl font-bold mt-2">{pendingDocs.length}</p>
            <p className="text-blue-100 text-sm mt-1">documents awaiting review</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-6">
        {pendingDocs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">All documents verified!</p>
            <p className="text-gray-400 text-sm mt-2">No pending documents for verification</p>
          </div>
        ) : (
          pendingDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{doc.business_name}</h3>
                    <p className="text-sm text-gray-600">{doc.provider_email}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Document Type</p>
                    <p className="font-medium text-gray-800 capitalize">{doc.document_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Uploaded On</p>
                    <p className="font-medium text-gray-800">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Document File</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium flex-1 truncate"
                    >
                      {doc.file_path.split("/").pop()}
                    </a>
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => verifyDocument(doc.id, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ✓ Approve Document
                  </button>
                  <button
                    onClick={() => handleReject(doc.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    ✗ Reject Document
                  </button>
                  <button
                    onClick={() => viewProviderDetails(doc.provider_id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    View All Docs
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Provider Documents Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">All Provider Documents</h2>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setProviderDocs([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {providerDocs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No documents found</p>
              ) : (
                providerDocs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">
                          {doc.document_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {doc.is_verified ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Document →
                    </a>
                    {doc.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {doc.rejection_reason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderVerification;
