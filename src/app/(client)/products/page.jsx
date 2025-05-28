//file: src/app/(client)/products/page.jsx
"use client";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Check, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

// Komponen kartu produk dengan tombol sejajar
const ProductCard = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart, getCartItem, updateQuantity, removeFromCart } = useCart();

  // Get current cart item for this product
  const cartItem = getCartItem(product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    setIsAdding(true);

    try {
      // Add to cart using context
      addToCart(product, 1);

      // Show success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (e, action) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "increase") {
      if (currentQuantity < product.stock) {
        if (currentQuantity === 0) {
          addToCart(product, 1);
        } else {
          updateQuantity(product.id, currentQuantity + 1);
        }
      }
    } else if (action === "decrease") {
      if (currentQuantity > 1) {
        updateQuantity(product.id, currentQuantity - 1);
      } else if (currentQuantity === 1) {
        removeFromCart(product.id);
      }
    }
  };

  // Render quantity controls when item is in cart
  const renderQuantityControls = () => (
    <div className="flex items-center justify-between w-full">
      <button
        onClick={(e) => handleQuantityChange(e, "decrease")}
        className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="font-medium text-green-600 mx-2 min-w-[1.5rem] text-center">
        {currentQuantity}
      </span>
      <button
        onClick={(e) => handleQuantityChange(e, "increase")}
        disabled={currentQuantity >= product.stock}
        className={`p-1 rounded-full transition-colors ${
          currentQuantity >= product.stock
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-green-100 text-green-600 hover:bg-green-200"
        }`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
      <Link href={`/products/${product.id}`}>
        <div className="relative cursor-pointer">
          <div className="w-full aspect-square">
            <Image
              src={product.mediaUrl || "/placeholder-product.jpg"}
              alt={product.name}
              width={500}
              height={500}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          {product.isNewArrival && (
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-green-500 text-white text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded">
              Produk Baru
            </div>
          )}
          {product.discountPrice && (
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded">
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )}
              % OFF
            </div>
          )}
          {/* Cart quantity indicator - moved to top right corner */}
          {currentQuantity > 0 && (
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center z-10">
              {currentQuantity}
            </div>
          )}
        </div>
      </Link>

      {/* Content section with flex-grow to push button to bottom */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 cursor-pointer hover:text-green-600 text-sm sm:text-base leading-tight min-h-[2.5rem] sm:min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Price and stock info section - flex-grow to take available space */}
        <div className="mb-2 sm:mb-3 flex-grow">
          {product.stock <= 0 && (
            <div className="text-xs text-red-500 font-medium mb-1">
              Stok Habis
            </div>
          )}
          {product.discountPrice ? (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="font-semibold text-red-600 text-sm sm:text-base">
                {formatPrice(product.discountPrice)}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-gray-800 text-sm sm:text-base">
              {formatPrice(product.price)}
            </span>
          )}
          <div className="text-xs text-gray-500">
            per {product.unit || "kemasan"}
          </div>
          {product.stock > 0 && product.stock <= 10 && (
            <div className="text-xs text-orange-500 font-medium">
              Stok tersisa {product.stock}
            </div>
          )}
        </div>

        {/* Cart Action Button - always at bottom */}
        <div className="w-full mt-auto">
          {product.stock <= 0 ? (
            <button
              disabled
              className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              <span>Stok Habis</span>
            </button>
          ) : currentQuantity > 0 ? (
            <div className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium bg-green-50 border border-green-200">
              {renderQuantityControls()}
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAdding || showSuccess}
              className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 ${
                showSuccess
                  ? "bg-green-500 text-white"
                  : isAdding
                  ? "bg-green-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
              }`}
            >
              {showSuccess ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Ditambahkan!</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : isAdding ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Menambahkan...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tambah ke Keranjang</span>
                  <span className="sm:hidden">Tambah</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
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

// Halaman produk
export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const { getCartItemsCount } = useCart();

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch data from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.data) {
          setProducts(data.data);
          setSearchResults(data.data);
          setPagination(
            data.meta || {
              page: 1,
              pageSize: data.data.length,
              totalCount: data.data.length,
              totalPages: 1,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        showToast("Gagal memuat produk", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchQuery.trim() === "") {
      // If search is empty, reset to original data
      setSearchResults(products);
      return;
    }

    setLoading(true);
    try {
      // Use API for search
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.data) {
        setSearchResults(data.data);
        setPagination(
          data.meta || {
            page: 1,
            pageSize: data.data.length,
            totalCount: data.data.length,
            totalPages: 1,
          }
        );
      }
    } catch (error) {
      console.error("Error searching products:", error);
      // Fallback to client-side filtering if API search fails
      const search = searchQuery.toLowerCase();
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search)
      );
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
          Kesehatan Sampai ke Rumah Anda
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          Kami siap mengantarkan produk dan kebutuhan kesehatan langsung ke
          pintu rumah Anda
        </p>

        {/* Cart summary */}
        {getCartItemsCount() > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {getCartItemsCount()} item dalam keranjang
                </span>
              </div>
              <Link
                href="/apotek/cart"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Keranjang →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Cari produk kesehatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 sm:p-3 pl-8 sm:pl-10 pr-16 sm:pr-20 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
          />
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <button
            type="submit"
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 active:bg-green-800"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Daftar Produk */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-full h-32 sm:h-40 bg-gray-200"></div>
                <div className="p-2 sm:p-3">
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-8 sm:h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center mx-2 sm:mx-0">
            <p className="text-gray-500 mb-2 text-sm sm:text-base">
              Tidak ada produk yang ditemukan
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              Coba ubah kata kunci pencarian
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3 sm:mb-4 px-1 sm:px-0">
              <p className="text-xs sm:text-sm text-gray-500">
                Menampilkan {searchResults.length} produk
                <span className="hidden sm:inline">
                  {" "}
                  dari {pagination.totalCount}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
