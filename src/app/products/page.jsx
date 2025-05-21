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

// Komponenen kartu produk obat
const MedicineCard = ({ medicine }) => {
  // Mendapatkan media utama (media pertama sebagai gambar utama)
  const getMainImage = () => {
    // Jika memiliki media array, gunakan URL dari media pertama jika itu gambar
    if (medicine.media && medicine.media.length > 0) {
      // Cari media pertama yang berupa gambar
      const firstImage = medicine.media.find((item) => item.type === "image");
      if (firstImage) {
        return firstImage.url;
      }
    }
    // Fallback ke placeholder jika media tidak ada atau tidak ada gambar
    return "/placeholder-medicine.jpg";
  };

  return (
    <Link href={`/products/${medicine.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative">
          <Image
            src={getMainImage()}
            alt={medicine.name}
            width={500}
            height={500}
            className="w-full h-40 object-cover"
            priority
          />
          {medicine.isNewArrival && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
              Produk Baru
            </div>
          )}
          {medicine.discountPrice && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              {Math.round(
                ((medicine.price - medicine.discountPrice) / medicine.price) *
                  100
              )}
              % OFF
            </div>
          )}
          {medicine.needsPrescription && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
              Resep
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
            {medicine.name}
          </h3>

          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {"★".repeat(Math.floor(medicine.rating || 0))}
              {"☆".repeat(5 - Math.floor(medicine.rating || 0))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({medicine.reviewCount || 0})
            </span>
          </div>

          <div className="mb-3">
            {medicine.stock <= 0 && (
              <div className="text-xs text-red-500 font-medium mb-1">
                Stok Habis
              </div>
            )}
            {medicine.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(medicine.price)}
                </span>
                <span className="font-semibold text-red-600">
                  {formatPrice(medicine.discountPrice)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-gray-800">
                {formatPrice(medicine.price)}
              </span>
            )}
            <div className="text-xs text-gray-500">
              per {medicine.unit || "kemasan"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Halaman produk apotek
export default function MedicinePage() {
  const [medicines, setMedicines] = useState([]);
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
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.data) {
          setMedicines(data.data);
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
        console.error("Error fetching medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchQuery.trim() === "") {
      // If search is empty, reset to original data
      setSearchResults(medicines);
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
      console.error("Error searching medicines:", error);
      // Fallback to client-side filtering if API search fails
      const search = searchQuery.toLowerCase();
      const results = medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(search) ||
          medicine.category.toLowerCase().includes(search)
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
        Kami siap mengantarkan obat-obatan dan kebutuhan kesehatan langsung ke
        pintu rumah Anda
      </p>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Cari obat, vitamin, atau kebutuhan kesehatan..."
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
              {searchResults.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
