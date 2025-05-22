"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative">
          <Image
            src={product.mediaUrl || "/placeholder-product.jpg"}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-40 object-cover"
            priority
          />
          {product.isNewArrival && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
              Produk Baru
            </div>
          )}
          {product.discountPrice && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )}
              % OFF
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {"★".repeat(Math.floor(product.rating || 0))}
              {"☆".repeat(5 - Math.floor(product.rating || 0))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="mb-3">
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
                <span className="font-semibold text-red-600">
                  {formatPrice(product.discountPrice)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-gray-800">
                {formatPrice(product.price)}
              </span>
            )}
            <div className="text-xs text-gray-500">
              per {product.unit || "kemasan"}
            </div>
          </div>
        </div>
      </div>
    </Link>
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
        Kesehatan Sampai ke Rumah Anda
      </h1>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Kami siap mengantarkan produk dan kebutuhan kesehatan langsung ke pintu
        rumah Anda
      </p>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Cari produk, vitamin, atau kebutuhan kesehatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Daftar Produk */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-full h-40 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">
              Tidak ada produk yang ditemukan
            </p>
            <p className="text-sm text-gray-400">
              Coba ubah kata kunci pencarian
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Menampilkan {searchResults.length} produk dari{" "}
                {pagination.totalCount}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
