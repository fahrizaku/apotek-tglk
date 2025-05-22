"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Save, Loader2, X, Search } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");

  // State untuk form
  const [formData, setFormData] = useState({
    name: "",
    categories: [],
    price: "",
    discountPrice: "",
    stock: "0",
    unit: "porsi",
    description: "",
    isNewArrival: false,
    mediaUrl: "",
    rating: "0",
    reviewCount: "0",
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data);
      } else {
        console.error("Error fetching categories:", data.message);
        setMessage({
          type: "error",
          text: "Gagal mengambil data kategori",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengambil data kategori",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Filter categories berdasarkan pencarian
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
      !formData.categories.includes(category.name)
  );

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/products/${productId}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data produk");
        }

        const product = await response.json();

        // Set form data from product
        setFormData({
          name: product.name || "",
          categories: product.categoryNames || [],
          price: product.price?.toString() || "",
          discountPrice: product.discountPrice?.toString() || "",
          stock: product.stock?.toString() || "0",
          unit: product.unit || "porsi",
          description: product.description || "",
          isNewArrival: product.isNewArrival || false,
          mediaUrl: product.mediaUrl || "",
          rating: product.rating?.toString() || "0",
          reviewCount: product.reviewCount?.toString() || "0",
        });

        // Set image preview if available
        if (product.mediaUrl) {
          setImagePreview(product.mediaUrl);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setMessage({
          type: "error",
          text: error.message || "Terjadi kesalahan saat mengambil data produk",
        });
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchCategories();
      fetchProduct();
    }
  }, [productId]);

  // Handle perubahan input form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle kategori selection
  const handleCategoryAdd = (categoryName) => {
    if (!formData.categories.includes(categoryName)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, categoryName],
      });
      setCategorySearch(""); // Clear search after adding
    }
  };

  // Handle kategori removal
  const handleCategoryRemove = (categoryName) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((cat) => cat !== categoryName),
    });
  };

  // Handle preview gambar saat URL dimasukkan
  const handleImagePreview = () => {
    if (formData.mediaUrl) {
      setImagePreview(formData.mediaUrl);
    }
  };

  // Handle kembali ke halaman sebelumnya
  const handleGoBack = () => {
    router.back();
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Validasi data
      if (
        !formData.name ||
        formData.categories.length === 0 ||
        !formData.price
      ) {
        setMessage({
          type: "error",
          text: "Nama, minimal satu kategori, dan harga wajib diisi",
        });
        setIsSubmitting(false);
        return;
      }

      // Kirim data ke API
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui produk");
      }

      setMessage({
        type: "success",
        text: "Produk berhasil diperbarui",
      });

      // Redirect ke halaman daftar produk setelah 2 detik
      setTimeout(() => {
        router.push("/admin/products");
      }, 2000);
    } catch (error) {
      console.error("Error updating product:", error);
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan saat memperbarui produk",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
        <span className="ml-2 text-gray-500">Memuat data produk...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Kolom Kiri - Informasi Dasar */}
          <div className="w-full md:w-2/3 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Categories Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>

              {/* Selected Categories */}
              {formData.categories.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((category) => (
                      <div
                        key={category}
                        className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => handleCategoryRemove(category)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Results */}
              {categorySearch && (
                <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto mb-2 bg-white shadow-sm">
                  {categoriesLoading ? (
                    <div className="p-3 text-gray-500 text-center">
                      Memuat kategori...
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryAdd(category.name)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-center">
                      Tidak ada kategori yang ditemukan
                    </div>
                  )}
                </div>
              )}

              {/* Category Selection Dropdown (fallback) */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleCategoryAdd(e.target.value);
                    e.target.value = "";
                  }
                }}
                disabled={categoriesLoading}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
              >
                <option value="">
                  {categoriesLoading
                    ? "Memuat kategori..."
                    : "Atau pilih dari dropdown"}
                </option>
                {categories
                  .filter((cat) => !formData.categories.includes(cat.name))
                  .map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </select>

              {/* Quick Add Category Input */}
              <div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Atau ketik kategori baru..."
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newCategory = e.target.value.trim();
                        if (
                          newCategory &&
                          !formData.categories.includes(newCategory)
                        ) {
                          handleCategoryAdd(newCategory);
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const newCategory = input.value.trim();
                      if (
                        newCategory &&
                        !formData.categories.includes(newCategory)
                      ) {
                        handleCategoryAdd(newCategory);
                        input.value = "";
                      }
                    }}
                    className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 text-sm"
                  >
                    Tambah
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tekan Enter atau klik Tambah untuk menambahkan kategori baru
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="discountPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Harga Diskon (Rp)
                </label>
                <input
                  type="number"
                  id="discountPrice"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stok
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div>
                <label
                  htmlFor="unit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Satuan
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="porsi, pcs, botol"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <label
                  htmlFor="reviewCount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jumlah Ulasan
                </label>
                <input
                  type="number"
                  id="reviewCount"
                  name="reviewCount"
                  value={formData.reviewCount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNewArrival"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isNewArrival"
                className="ml-2 block text-sm text-gray-700"
              >
                Tandai sebagai Produk Baru
              </label>
            </div>
          </div>

          {/* Kolom Kanan - Gambar Produk */}
          <div className="w-full md:w-1/3 space-y-4">
            <div>
              <label
                htmlFor="mediaUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Gambar
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="mediaUrl"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://"
                />
                <button
                  type="button"
                  onClick={handleImagePreview}
                  className="bg-gray-200 p-2 rounded-r-md hover:bg-gray-300"
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-md p-2 h-64 flex items-center justify-center">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={() => {
                      setImagePreview(null);
                      setMessage({
                        type: "error",
                        text: "Gagal memuat gambar. Periksa URL gambar.",
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <span>Preview gambar</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleGoBack}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
