//file: src/app/(client)/products/[id]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Heart,
  Share2,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// Fungsi untuk memformat harga
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Toast notification component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-[70] p-4 rounded-lg shadow-lg border max-w-xs ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      <div className="flex items-center gap-2">
        {type === "success" && <Check className="w-4 h-4" />}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    addToCart,
    getCartItem,
    updateQuantity: updateCartQuantity,
    removeFromCart,
    getCartItemsCount,
  } = useCart();

  // Get current cart item for this product
  const cartItem = getCartItem(product?.id);
  const currentCartQuantity = cartItem ? cartItem.quantity : 0;

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Debug: Monitor cart changes
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Cart updated:", {
        productId: product?.id,
        cartItem,
        currentCartQuantity,
        totalCartItems: getCartItemsCount(),
      });
    }
  }, [cartItem, currentCartQuantity, product?.id, getCartItemsCount]);

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

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    setIsAddingToCart(true);

    try {
      addToCart(product, 1); // Always add 1 item at a time
      setShowSuccess(true);
      showToast(`${product.name} ditambahkan ke keranjang`);

      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Gagal menambahkan ke keranjang", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCartQuantityChange = (action) => {
    if (!product) return;

    if (action === "increase") {
      if (currentCartQuantity < product.stock) {
        if (currentCartQuantity === 0) {
          addToCart(product, 1);
        } else {
          updateCartQuantity(product.id, currentCartQuantity + 1);
        }
      }
    } else if (action === "decrease") {
      if (currentCartQuantity > 1) {
        updateCartQuantity(product.id, currentCartQuantity - 1);
      } else if (currentCartQuantity === 1) {
        removeFromCart(product.id);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Lihat produk ${product.name} di Trenggalek Apotek`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing failed:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast("Link produk disalin ke clipboard");
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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header with back button and actions */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Cart Summary Banner */}
      {getCartItemsCount() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {getCartItemsCount()} item dalam keranjang
              </span>
            </div>
            <button
              onClick={() => router.push("/apotek/cart")}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Lihat Keranjang →
            </button>
          </div>
        </div>
      )}

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

            {/* Cart quantity indicator on image */}
            {currentCartQuantity > 0 && (
              <div className="absolute top-4 right-4 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {currentCartQuantity} di keranjang
              </div>
            )}
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
              {product.description || "Deskripsi produk akan segera tersedia."}
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

          {/* Debug info - remove this in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 text-xs">
              <div>Product ID: {product?.id}</div>
              <div>Cart Item: {cartItem ? "Found" : "Not found"}</div>
              <div>Current Quantity: {currentCartQuantity}</div>
              <div>Total Cart Items: {getCartItemsCount()}</div>
            </div>
          )}

          {/* Cart Summary Info */}
          {currentCartQuantity > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-800 font-medium">
                  {currentCartQuantity} item di keranjang
                </span>
                <button
                  onClick={() => router.push("/apotek/cart")}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Lihat Keranjang →
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            {product.stock > 0 ? (
              currentCartQuantity > 0 ? (
                /* Quantity Controls - replaces add to cart button when item is in cart */
                <div className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCartQuantityChange("decrease")}
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-green-600 mx-4 text-lg min-w-[2rem] text-center">
                      {currentCartQuantity}
                    </span>
                    <button
                      onClick={() => handleCartQuantityChange("increase")}
                      disabled={currentCartQuantity >= product.stock}
                      className={`p-2 rounded-full transition-colors ${
                        currentCartQuantity >= product.stock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center text-xs text-green-600 mt-1">
                    Di Keranjang
                  </div>
                </div>
              ) : (
                /* Add to Cart Button when item not in cart */
                <button
                  className={`w-full py-2 sm:py-3 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 ${
                    showSuccess
                      ? "bg-green-500 text-white"
                      : isAddingToCart
                      ? "bg-green-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                  }`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || showSuccess}
                >
                  {showSuccess ? (
                    <>
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span>Ditambahkan ke Keranjang!</span>
                    </>
                  ) : isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Menambahkan...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span>Tambahkan ke Keranjang</span>
                    </>
                  )}
                </button>
              )
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
