"use client";
import { useState, useEffect } from "react";
import { Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Fungsi untuk memformat harga
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Komponenen kartu produk
const ProductCard = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation(); // Stop event bubbling

    setIsAdding(true);

    try {
      // Add your cart API call here
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // You can add a toast notification here
        console.log("Product added to cart successfully");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative cursor-pointer">
          <Image
            src={product.mediaUrl || "/placeholder-product.jpg"}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-32 sm:h-40 object-cover"
            priority
          />
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
        </div>
      </Link>

      <div className="p-2 sm:p-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 cursor-pointer hover:text-green-600 text-sm sm:text-base leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2 sm:mb-3">
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
        </div>

        {/* Tombol Tambah ke Keranjang */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAdding}
          className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors ${
            product.stock <= 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isAdding
              ? "bg-green-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          }`}
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">
            {isAdding
              ? "Menambahkan..."
              : product.stock <= 0
              ? "Stok Habis"
              : "Tambah ke Keranjang"}
          </span>
          <span className="sm:hidden">
            {isAdding ? "..." : product.stock <= 0 ? "Habis" : "Tambah"}
          </span>
        </button>
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
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
          Kesehatan Sampai ke Rumah Anda
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          Kami siap mengantarkan produk dan kebutuhan kesehatan langsung ke
          pintu rumah Anda
        </p>
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
