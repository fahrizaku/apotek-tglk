"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Loader2, X, Save } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: "",
  });

  // Form data for add/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Gagal mengambil data kategori",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengambil data kategori",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle add category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({
        type: "error",
        text: "Nama kategori wajib diisi",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan kategori");
      }

      setMessage({
        type: "success",
        text: "Kategori berhasil ditambahkan",
      });

      // Reset form and close modal
      setFormData({ name: "", description: "" });
      setShowAddModal(false);

      // Refresh categories
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat menambahkan kategori",
      });
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  // Handle update category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({
        type: "error",
        text: "Nama kategori wajib diisi",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui kategori");
      }

      setMessage({
        type: "success",
        text: "Kategori berhasil diperbarui",
      });

      // Reset form and close edit mode
      setFormData({ name: "", description: "" });
      setEditingCategory(null);

      // Refresh categories
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat memperbarui kategori",
      });
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!deleteModal.categoryId) return;

    try {
      const response = await fetch(
        `/api/admin/categories/${deleteModal.categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Gagal menghapus kategori");
      }

      setMessage({
        type: "success",
        text: "Kategori berhasil dihapus",
      });

      // Close modal and refresh categories
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat menghapus kategori",
      });
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
          Kelola Kategori
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori Baru
        </button>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="animate-spin h-8 w-8 text-green-500" />
            <span className="ml-2 text-gray-500">Memuat kategori...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 mb-2">Belum ada kategori</p>
            <p className="text-sm text-gray-400">
              Tambahkan kategori pertama untuk mulai mengorganisir produk
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingCategory?.id === category.id ? (
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 max-w-xs">
                          {category.description || "Tidak ada deskripsi"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category._count?.products || 0} produk
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCategory?.id === category.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleUpdateCategory}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(null);
                              setFormData({ name: "", description: "" });
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                categoryId: category.id,
                                categoryName: category.name,
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                            disabled={category._count?.products > 0}
                            title={
                              category._count?.products > 0
                                ? "Tidak dapat menghapus kategori yang memiliki produk"
                                : "Hapus kategori"
                            }
                          >
                            <Trash
                              className={`h-4 w-4 ${
                                category._count?.products > 0
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              onClick={() => setShowAddModal(false)}
            ></div>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddCategory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Tambah Kategori Baru
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Kategori{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Tambah Kategori
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ name: "", description: "" });
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              onClick={() =>
                setDeleteModal({
                  isOpen: false,
                  categoryId: null,
                  categoryName: "",
                })
              }
            ></div>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Kategori
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus kategori "
                        {deleteModal.categoryName}"? Tindakan ini tidak dapat
                        dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hapus
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      categoryId: null,
                      categoryName: "",
                    })
                  }
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
