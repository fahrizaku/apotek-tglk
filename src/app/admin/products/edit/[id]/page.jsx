"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ImageIcon, Save, Loader2 } from "lucide-react";

// Daftar kategori produk (contoh)
const PRODUCT_CATEGORIES = [
  "Makanan",
  "Minuman",
  "Obat",
  "Vitamin",
  "Kesehatan",
  "Perawatan Tubuh",
  "Perawatan Wajah",
  "Lainnya",
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);

  // State untuk form
  const [formData, setFormData] = useState({
    name: "",
    category: "",
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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/products/${id}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data produk");
        }

        const product = await response.json();

        // Set form data from product
        setFormData({
          name: product.name || "",
          category: product.category || "",
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

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle perubahan input form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
      if (!formData.name || !formData.category || !formData.price) {
        setMessage({
          type: "error",
          text: "Nama, kategori, dan harga wajib diisi",
        });
        setIsSubmitting(false);
        return;
      }

      // Kirim data ke API
      const response = await fetch(`/api/admin/products/${id}`, {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
        <span className="ml-2 text-gray-500">Memuat data produk...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Edit Produk
        </h1>
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

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Pilih Kategori</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
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
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
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
