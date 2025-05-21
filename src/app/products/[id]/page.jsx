"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  MinusCircle,
  PlusCircle,
  Link,
} from "lucide-react";
import MediaGallery from "./_components/MediaGallery";

// Fungsi untuk memformat harga
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mediaToDisplay, setMediaToDisplay] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/products/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Produk tidak ditemukan");
          } else {
            setError("Terjadi kesalahan saat mengambil data");
          }
          setLoading(false);
          return;
        }

        const foundProduct = await response.json();
        setProduct(foundProduct);

        if (foundProduct) {
          // Set default variant if available
          if (foundProduct.variants && foundProduct.variants.length > 0) {
            setSelectedVariant(foundProduct.variants[0]);
          }

          // Initialize media
          setMediaToDisplay(foundProduct.media || []);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Update displayed media when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.media) {
      // Show variant media first, followed by product media (excluding duplicates)
      const variantMedia = selectedVariant.media || [];
      const productMedia = product.media || [];

      // Combine the media, prioritizing variant media
      const combinedMedia = [
        ...variantMedia,
        ...productMedia.filter(
          (pm) => !variantMedia.some((vm) => vm.url === pm.url)
        ),
      ];

      setMediaToDisplay(combinedMedia);
    } else if (product) {
      setMediaToDisplay(product.media || []);
    }
  }, [selectedVariant, product]);

  const handleGoBack = () => {
    router.back();
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const currentStock = selectedVariant
      ? selectedVariant.stock
      : product.stock;

    if (newQuantity >= 1 && (!currentStock || newQuantity <= currentStock)) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);

    // Reset quantity if it exceeds variant stock
    if (variant.stock && quantity > variant.stock) {
      setQuantity(1);
    }
  };

  // Calculate current price based on selected variant
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.discountPrice || selectedVariant.price;
    }
    return product.discountPrice || product.price;
  };

  // Calculate original price based on selected variant
  const getOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.discountPrice ? selectedVariant.price : null;
    }
    return product.discountPrice ? product.price : null;
  };

  // Get current stock based on selected variant
  const getCurrentStock = () => {
    return selectedVariant ? selectedVariant.stock : product.stock;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-200 rounded mb-4 sm:mb-6"></div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-full md:w-1/2 h-64 sm:h-80 bg-gray-200 rounded-lg mb-4 md:mb-0"></div>
            <div className="w-full md:w-1/2">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/4 mb-4 sm:mb-6"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded mb-4 sm:mb-6 w-3/4"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mb-4 sm:mb-6"></div>
              <div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali</span>
        </button>
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
            {error || "Produk Tidak Ditemukan"}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Maaf, produk yang Anda cari tidak tersedia
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Kembali</span>
      </button>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Media Gallery */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <MediaGallery media={mediaToDisplay} />

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {product.isNewArrival && (
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                Menu Baru
              </div>
            )}
            {selectedVariant && selectedVariant.discountPrice ? (
              <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                {Math.round(
                  ((selectedVariant.price - selectedVariant.discountPrice) /
                    selectedVariant.price) *
                    100
                )}
                % Diskon
              </div>
            ) : (
              product.discountPrice && (
                <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100
                  )}
                  % Diskon
                </div>
              )
            )}
            {getCurrentStock() <= 10 && getCurrentStock() > 0 && (
              <div className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                Sisa {getCurrentStock()} {product.unit || "porsi"}
              </div>
            )}
            {getCurrentStock() <= 0 && (
              <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                Stok Habis
              </div>
            )}
          </div>
        </div>

        {/* Detail Produk */}
        <div className="w-full md:w-1/2">
          {/* Nama Produk */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {product.name}
            </h1>

            {/* Harga Produk (Dipindahkan ke sini, di bawah nama produk) */}
            <div className="mt-2">
              {getOriginalPrice() ? (
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base text-gray-500 line-through">
                    {formatPrice(getOriginalPrice())}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-red-600">
                    {formatPrice(getCurrentPrice())}
                  </span>
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-gray-800">
                  {formatPrice(getCurrentPrice())}
                </span>
              )}
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                per {product.unit || "porsi"}
              </div>
            </div>
          </div>

          {/* Rating dan Review */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill={
                      index < Math.floor(product.rating || 0)
                        ? "currentColor"
                        : "none"
                    }
                    strokeWidth={
                      index < Math.floor(product.rating || 0) ? 0 : 2
                    }
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-500 ml-2">
                ({product.reviewCount || 0} ulasan)
              </span>
            </div>
          </div>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="border-b border-gray-200 pb-3 mb-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
                Varian
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    className={`px-3 py-2 rounded-md border ${
                      selectedVariant && selectedVariant.name === variant.name
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${
                      variant.stock <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      variant.stock > 0 && handleVariantChange(variant)
                    }
                    disabled={variant.stock <= 0}
                  >
                    <div className="flex items-center gap-2">
                      {variant.thumbnail && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                          <Image
                            src={variant.thumbnail}
                            alt={variant.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {variant.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deskripsi Produk */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
              Deskripsi
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {selectedVariant && selectedVariant.description
                ? selectedVariant.description
                : product.description || "-"}
            </p>
          </div>

          {/* Informasi Ketersediaan */}
          <div className="border-b border-gray-200 pb-3 mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
              Ketersediaan
            </h3>
            <p
              className={`text-sm sm:text-base ${
                getCurrentStock() <= 0
                  ? "text-red-500 font-medium"
                  : getCurrentStock() <= 10
                  ? "text-orange-500 font-medium"
                  : "text-green-600 font-medium"
              }`}
            >
              {getCurrentStock() <= 0
                ? "Stok Habis"
                : getCurrentStock() <= 10
                ? `Sisa ${getCurrentStock()} ${product.unit || "porsi"}`
                : "Stok Tersedia"}
            </p>
          </div>

          {/* Quantity selector */}
          {getCurrentStock() > 0 && (
            <div className="border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
                Jumlah
              </h3>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className={`p-1 ${
                    quantity <= 1
                      ? "text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MinusCircle className="h-6 w-6" />
                </button>
                <span className="mx-3 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={
                    getCurrentStock() !== null && quantity >= getCurrentStock()
                  }
                  className={`p-1 ${
                    getCurrentStock() !== null && quantity >= getCurrentStock()
                      ? "text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <PlusCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* Informasi Pembelian */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            {getCurrentStock() > 0 ? (
              <button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 sm:py-3 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium"
                onClick={() =>
                  alert(
                    `Menambahkan ${quantity} ${product.name}${
                      selectedVariant ? ` (${selectedVariant.name})` : ""
                    } ke keranjang`
                  )
                }
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            ) : (
              <button
                className="w-full bg-gray-300 text-gray-500 py-2 sm:py-3 rounded-lg flex items-center justify-center cursor-not-allowed text-sm sm:text-base font-medium"
                disabled
              >
                <span>Stok Habis</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
