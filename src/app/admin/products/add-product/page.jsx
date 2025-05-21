"use client";
import { useState } from "react";

export default function AddFoodProduct() {
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
  });

  // State for variants
  const [variants, setVariants] = useState([
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

  // State for main food media
  const [media, setMedia] = useState([
    { type: "image", url: "", caption: "", thumbnail: "" },
  ]);

  // Handle main form changes
  const handleFoodChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFoodData({
      ...foodData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" || name === "discountPrice" || name === "stock"
          ? value === ""
            ? ""
            : parseInt(value, 10)
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

    // Create the complete food object
    const newFood = {
      ...foodData,
      media,
      variants,
    };

    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/admin/foods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFood),
      });

      if (response.ok) {
        alert("Produk berhasil ditambahkan!");
        // Reset form or redirect
        resetForm();
      } else {
        const error = await response.json();
        alert(`Gagal menambahkan produk: ${error.message}`);
      }
    } catch (error) {
      console.error("Error adding food:", error);
      alert("Terjadi kesalahan saat menambahkan produk.");
    }
  };

  // Reset the form
  const resetForm = () => {
    setFoodData({
      name: "",
      category: "",
      price: "",
      discountPrice: "",
      unit: "porsi",
      description: "",
      isNewArrival: false,
      stock: 0,
    });
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
    setMedia([{ type: "image", url: "", caption: "", thumbnail: "" }]);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Tambah Produk Makanan
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
                      value={item.type}
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
                      value={item.url}
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
                      value={item.caption}
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
                      value={item.thumbnail}
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
                      value={variant.name}
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
                      value={variant.price}
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
                      value={variant.discountPrice}
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
                      value={variant.stock}
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
                      value={variant.thumbnail}
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
                      value={variant.description}
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
                              value={mediaItem.type}
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
                              value={mediaItem.url}
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
                              value={mediaItem.caption}
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
                              value={mediaItem.thumbnail}
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
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
