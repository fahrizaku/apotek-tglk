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

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${id}`);

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

  const handleGoBack = () => {
    router.back();
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && (!product.stock || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
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
        {/* Product Image */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <Image
              src={product.mediaUrl || "/placeholder-product.jpg"}
              alt={product.name}
              width={800}
              height={600}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
              priority
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {product.isNewArrival && (
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                Produk Baru
              </div>
            )}
            {product.discountPrice && (
              <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                {Math.round(
                  ((product.price - product.discountPrice) / product.price) *
                    100
                )}
                % Diskon
              </div>
            )}
            {product.stock <= 10 && product.stock > 0 && (
              <div className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                Sisa {product.stock} {product.unit || "porsi"}
              </div>
            )}
            {product.stock <= 0 && (
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

            {/* Harga Produk */}
            <div className="mt-2">
              {product.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-red-600">
                    {formatPrice(product.discountPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-gray-800">
                  {formatPrice(product.price)}
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

          {/* Deskripsi Produk */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
              Deskripsi
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {product.description || "-"}
            </p>
          </div>

          {/* Informasi Ketersediaan */}
          <div className="border-b border-gray-200 pb-3 mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
              Ketersediaan
            </h3>
            <p
              className={`text-sm sm:text-base ${
                product.stock <= 0
                  ? "text-red-500 font-medium"
                  : product.stock <= 10
                  ? "text-orange-500 font-medium"
                  : "text-green-600 font-medium"
              }`}
            >
              {product.stock <= 0
                ? "Stok Habis"
                : product.stock <= 10
                ? `Sisa ${product.stock} ${product.unit || "porsi"}`
                : "Stok Tersedia"}
            </p>
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
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
                  disabled={product.stock !== null && quantity >= product.stock}
                  className={`p-1 ${
                    product.stock !== null && quantity >= product.stock
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
            {product.stock > 0 ? (
              <button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 sm:py-3 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium"
                onClick={() =>
                  alert(`Menambahkan ${quantity} ${product.name} ke keranjang`)
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
