import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function BlogPostsManager() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    isPublished: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/admin/features/blog-posts");
      setPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      alert("Failed to fetch blog posts");
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
        await axios.put(`/api/admin/features/blog-posts/${editingId}`, formData);
        alert("Blog post updated successfully");
      } else {
        await axios.post("/api/admin/features/blog-posts", formData);
        alert("Blog post created successfully");
      }

      setFormData({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        isPublished: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("Failed to save blog post");
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      isPublished: post.is_published,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await axios.delete(`/api/admin/features/blog-posts/${id}`);
        alert("Blog post deleted successfully");
        fetchPosts();
      } catch (error) {
        console.error("Error deleting blog post:", error);
        alert("Failed to delete blog post");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading blog posts...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: "#2C3E50" }}>
          Blog Posts Management
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: "",
              slug: "",
              content: "",
              excerpt: "",
              isPublished: false,
            });
          }}
          className="text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: "#1B3A5F" }}
        >
          <FaPlus /> Add Post
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Blog Post" : "Add New Blog Post"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Blog Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog post title"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Blog Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="Enter blog slug (URL-friendly)"
                className="w-full px-3 py-2 border rounded"
                required
              />
              <small className="text-gray-500">Auto-generated from title, or set manually</small>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief summary of the blog post (shown in listings)"
                rows="2"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Blog Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter full blog post content (HTML supported)"
                rows="10"
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
              <label className="ml-2 text-sm font-medium">Publish Post</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: "#00A86B" }}
              >
                {editingId ? "Update" : "Create"} Post
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
            {posts.length === 0 ? (
              <tr>
                <td colSpan="4" className="border p-4 text-center text-gray-500">
                  No blog posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <div className="font-medium">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-sm text-gray-600 truncate">{post.excerpt}</div>
                    )}
                  </td>
                  <td className="border p-2 text-sm text-gray-600">{post.slug}</td>
                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        post.is_published
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
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

export default BlogPostsManager;
