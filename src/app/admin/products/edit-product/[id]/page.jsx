"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditFoodProduct({ params }) {
  const router = useRouter();
  const foodId = params?.id;

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Main food form state
  const [foodData, setFoodData] = useState({
    name: "",
    category: "",
    price: "",
    discountPrice: "",
    unit: "porsi",
    description: "",
    isNewArrival: false,
    stock: 0,
    rating: 0,
    reviewCount: 0,
  });

  // State for variants
  const [variants, setVariants] = useState([]);

  // State for main food media
  const [media, setMedia] = useState([]);

  // Fetch product data
  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/products/${foodId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }

        const food = await response.json();

        // Set main food data
        setFoodData({
          name: food.name || "",
          category: food.category || "",
          price: food.price || 0,
          discountPrice: food.discountPrice || "",
          unit: food.unit || "porsi",
          description: food.description || "",
          isNewArrival: food.isNewArrival || false,
          stock: food.stock || 0,
          rating: food.rating || 0,
          reviewCount: food.reviewCount || 0,
        });

        // Set media
        if (food.media && food.media.length > 0) {
          setMedia(food.media);
        } else {
          setMedia([{ type: "image", url: "", caption: "", thumbnail: "" }]);
        }

        // Set variants
        if (food.variants && food.variants.length > 0) {
          setVariants(food.variants);
        } else {
          setVariants([
            {
              name: "",
              price: "",
              discountPrice: "",
              stock: 0,
              description: "",
              thumbnail: "",
              media: [],
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching food:", err);
        setError("Gagal mengambil data produk. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFood();
  }, [foodId]);

  // Handle main form changes
  const handleFoodChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFoodData({
      ...foodData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" ||
            name === "discountPrice" ||
            name === "stock" ||
            name === "reviewCount"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : name === "rating"
          ? value === ""
            ? 0
            : parseFloat(value)
          : value,
    });
  };

  // Handle variant changes
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...variants];
    updatedVariants[index][name] =
      name === "price" || name === "discountPrice" || name === "stock"
        ? value === ""
          ? ""
          : parseInt(value, 10)
        : value;
    setVariants(updatedVariants);
  };

  // Add a new variant
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        price: "",
        discountPrice: "",
        stock: 0,
        description: "",
        thumbnail: "",
        media: [],
      },
    ]);
  };

  // Remove a variant
  const removeVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  // Handle media changes
  const handleMediaChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMedia = [...media];
    updatedMedia[index][name] = value;
    setMedia(updatedMedia);
  };

  // Add new media
  const addMedia = () => {
    setMedia([
      ...media,
      { type: "image", url: "", caption: "", thumbnail: "" },
    ]);
  };

  // Remove media
  const removeMedia = (index) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setMedia(updatedMedia);
  };

  // Handle variant media changes
  const handleVariantMediaChange = (variantIndex, mediaIndex, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...variants];
    if (!updatedVariants[variantIndex].media) {
      updatedVariants[variantIndex].media = [];
    }

    if (!updatedVariants[variantIndex].media[mediaIndex]) {
      updatedVariants[variantIndex].media[mediaIndex] = {
        type: "image",
        url: "",
        caption: "",
        thumbnail: "",
      };
    }

    updatedVariants[variantIndex].media[mediaIndex][name] = value;
    setVariants(updatedVariants);
  };

  // Add variant media
  const addVariantMedia = (variantIndex) => {
    const updatedVariants = [...variants];
    if (!updatedVariants[variantIndex].media) {
      updatedVariants[variantIndex].media = [];
    }
    updatedVariants[variantIndex].media.push({
      type: "image",
      url: "",
      caption: "",
      thumbnail: "",
    });
    setVariants(updatedVariants);
  };

  // Remove variant media
  const removeVariantMedia = (variantIndex, mediaIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].media.splice(mediaIndex, 1);
    setVariants(updatedVariants);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!foodId) {
      setError("ID produk tidak valid");
      return;
    }

    // Create the complete food object
    const updatedFood = {
      ...foodData,
      media,
      variants: variants.filter((variant) => variant.name.trim() !== ""),
    };

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/products/${foodId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFood),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      // Redirect back to products list on success
      alert("Produk berhasil diperbarui!");
      router.push("/products"); // Adjust this path to match your route structure
    } catch (error) {
      console.error("Error updating food:", error);
      setError(`Gagal memperbarui produk: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    if (confirm("Perubahan tidak akan disimpan. Yakin ingin kembali?")) {
      router.push("/products"); // Adjust this path to match your route structure
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="text-center text-red-600 p-4">
            <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
            <p>{error}</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => router.push("/products")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Kembali ke Daftar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Edit Produk Makanan
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Food Info Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Informasi Produk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  name="name"
                  value={foodData.name}
                  onChange={handleFoodChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={foodData.category}
                  onChange={handleFoodChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Makanan Utama">Makanan Utama</option>
                  <option value="Makanan Ringan">Makanan Ringan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={foodData.price}
                  onChange={handleFoodChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Diskon (Rp)
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={foodData.discountPrice}
                  onChange={handleFoodChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  name="stock"
                  value={foodData.stock}
                  onChange={handleFoodChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  name="unit"
                  value={foodData.unit}
                  onChange={handleFoodChange}
                  placeholder="porsi, mangkok, pcs, dll"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={foodData.rating || 0}
                  onChange={handleFoodChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Review
                </label>
                <input
                  type="number"
                  name="reviewCount"
                  value={foodData.reviewCount || 0}
                  onChange={handleFoodChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={foodData.description}
                  onChange={handleFoodChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNewArrival"
                  name="isNewArrival"
                  checked={foodData.isNewArrival}
                  onChange={handleFoodChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isNewArrival"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Produk Baru
                </label>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Media Produk
              </h2>
              <button
                type="button"
                onClick={addMedia}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Tambah Media
              </button>
            </div>

            {media.map((item, index) => (
              <div key={index} className="border p-4 rounded-md mb-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Media #{index + 1}</h3>
                  {media.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Media
                    </label>
                    <select
                      name="type"
                      value={item.type || "image"}
                      onChange={(e) => handleMediaChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="image">Gambar</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL {item.type === "image" ? "Gambar" : "Video"}
                    </label>
                    <input
                      type="text"
                      name="url"
                      value={item.url || ""}
                      onChange={(e) => handleMediaChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <input
                      type="text"
                      name="caption"
                      value={item.caption || ""}
                      onChange={(e) => handleMediaChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Thumbnail
                    </label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={item.thumbnail || ""}
                      onChange={(e) => handleMediaChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Variants Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Varian Produk
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Tambah Varian
              </button>
            </div>

            {variants.map((variant, vIndex) => (
              <div key={vIndex} className="border p-4 rounded-md mb-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Varian #{vIndex + 1}</h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus Varian
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Varian *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={variant.name || ""}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={variant.price || ""}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={variant.discountPrice || ""}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={variant.stock || 0}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Thumbnail
                    </label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={variant.thumbnail || ""}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi Varian
                    </label>
                    <textarea
                      name="description"
                      value={variant.description || ""}
                      onChange={(e) => handleVariantChange(vIndex, e)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>

                {/* Variant Media Section */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Media Varian</h4>
                    <button
                      type="button"
                      onClick={() => addVariantMedia(vIndex)}
                      className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      + Tambah Media
                    </button>
                  </div>

                  {variant.media && variant.media.length > 0 ? (
                    variant.media.map((mediaItem, mediaIndex) => (
                      <div
                        key={mediaIndex}
                        className="border p-3 rounded mb-3 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Media #{mediaIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantMedia(vIndex, mediaIndex)
                            }
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tipe
                            </label>
                            <select
                              name="type"
                              value={mediaItem.type || "image"}
                              onChange={(e) =>
                                handleVariantMediaChange(vIndex, mediaIndex, e)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                            >
                              <option value="image">Gambar</option>
                              <option value="video">Video</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              URL
                            </label>
                            <input
                              type="text"
                              name="url"
                              value={mediaItem.url || ""}
                              onChange={(e) =>
                                handleVariantMediaChange(vIndex, mediaIndex, e)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Caption
                            </label>
                            <input
                              type="text"
                              name="caption"
                              value={mediaItem.caption || ""}
                              onChange={(e) =>
                                handleVariantMediaChange(vIndex, mediaIndex, e)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Thumbnail
                            </label>
                            <input
                              type="text"
                              name="thumbnail"
                              value={mediaItem.thumbnail || ""}
                              onChange={(e) =>
                                handleVariantMediaChange(vIndex, mediaIndex, e)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Belum ada media untuk varian ini
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                saving ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
