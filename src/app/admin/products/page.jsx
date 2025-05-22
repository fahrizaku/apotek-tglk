"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
} from "lucide-react";

// Fungsi untuk memformat harga
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch categories from API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories([{ name: "Semua Kategori" }, ...data]);
      } else {
        console.error("Error fetching categories:", data.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Prepare URL with filters
      let url = `/api/admin/products?page=${pagination.page}`;

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (selectedCategory && selectedCategory !== "Semua Kategori") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.data) {
        setProducts(data.data);
        setPagination({
          ...pagination,
          totalCount: data.meta.totalCount,
          totalPages: data.meta.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengambil data produk",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load categories on initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load products on initial load and when filters change
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, selectedCategory]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Reset to page 1 when changing category
    setPagination({ ...pagination, page: 1 });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Handle delete product
  const handleDelete = async () => {
    if (!deleteModal.productId) return;

    try {
      const response = await fetch(
        `/api/admin/products/${deleteModal.productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus produk");
      }

      setMessage({
        type: "success",
        text: "Produk berhasil dihapus",
      });

      // Close modal and refresh products
      setDeleteModal({ isOpen: false, productId: null, productName: "" });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat menghapus produk",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
          Kelola Produk
        </h1>
        <button
          onClick={() => router.push("/admin/products/add")}
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk Baru
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

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            {/* Search */}
            <div className="flex-1 mb-4 sm:mb-0">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Category Filter */}
            <div className="flex items-center">
              <Filter className="text-gray-400 w-4 h-4 mr-2" />
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={categoriesLoading}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                {categoriesLoading ? (
                  <option>Memuat kategori...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                      {category._count?.products !== undefined &&
                        category.name !== "Semua Kategori" &&
                        ` (${category._count.products})`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="animate-spin h-8 w-8 text-green-500" />
            <span className="ml-2 text-gray-500">Memuat produk...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 mb-2">
              Tidak ada produk yang ditemukan
            </p>
            <p className="text-sm text-gray-400">
              Coba ubah filter atau tambahkan produk baru
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Produk
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Kategori
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Harga
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stok
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img
                              src={product.mediaUrl || "/api/placeholder/40/40"}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.categoryNames &&
                          product.categoryNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.categoryNames.map(
                                (categoryName, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {categoryName}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              Tidak ada kategori
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.discountPrice ? (
                          <div>
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                            <div className="text-sm font-medium text-red-600">
                              {formatPrice(product.discountPrice)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            product.stock <= 0
                              ? "text-red-600 font-medium"
                              : product.stock <= 10
                              ? "text-orange-600 font-medium"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock} {product.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            router.push(`/admin/products/edit/${product.id}`)
                          }
                          className="text-green-600 hover:text-green-900 mr-3 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              productId: product.id,
                              productName: product.name,
                            })
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Berikutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan{" "}
                    <span className="font-medium">{products.length}</span> dari{" "}
                    <span className="font-medium">{pagination.totalCount}</span>{" "}
                    produk
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: pagination.totalPages }).map(
                      (_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            pagination.page === index + 1
                              ? "z-10 bg-green-50 border-green-500 text-green-600"
                              : "bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500/75 transition-opacity"
              onClick={() =>
                setDeleteModal({
                  isOpen: false,
                  productId: null,
                  productName: "",
                })
              }
            ></div>

            {/* Modal dialog */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Produk
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus produk "
                        {deleteModal.productName}"? Tindakan ini tidak dapat
                        dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hapus
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      productId: null,
                      productName: "",
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
