"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

// Dummy data for stats cards
const statsData = [
  {
    title: "Total Produk",
    value: "0",
    icon: Package,
    color: "bg-blue-500",
    link: "/admin/products",
  },
  {
    title: "Pesanan Baru",
    value: "0",
    icon: ShoppingBag,
    color: "bg-orange-500",
    link: "/admin/orders",
  },
  {
    title: "Total Pengguna",
    value: "0",
    icon: Users,
    color: "bg-green-500",
    link: "/admin/users",
  },
  {
    title: "Pendapatan Bulan Ini",
    value: "Rp 0",
    icon: TrendingUp,
    color: "bg-purple-500",
    link: "/admin/reports",
  },
];

// Dummy data for recent orders
const recentOrdersData = [
  {
    id: "ORD001",
    customer: "Ahmad Rizki",
    date: "21 Mei 2025",
    amount: "Rp 150.000",
    status: "completed",
  },
  {
    id: "ORD002",
    customer: "Siti Nurhayati",
    date: "20 Mei 2025",
    amount: "Rp 85.000",
    status: "processing",
  },
  {
    id: "ORD003",
    customer: "Budi Santoso",
    date: "19 Mei 2025",
    amount: "Rp 230.000",
    status: "completed",
  },
  {
    id: "ORD004",
    customer: "Diana Putri",
    date: "18 Mei 2025",
    amount: "Rp 120.000",
    status: "pending",
  },
  {
    id: "ORD005",
    customer: "Eko Prasetyo",
    date: "17 Mei 2025",
    amount: "Rp 95.000",
    status: "completed",
  },
];

// Function to get status styles
const getStatusStyles = (status) => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle2,
        label: "Selesai",
      };
    case "processing":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: Clock,
        label: "Diproses",
      };
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: AlertCircle,
        label: "Menunggu",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: AlertCircle,
        label: "Unknown",
      };
  }
};

// Dashboard component
export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch product count
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (data.meta) {
          setProductCount(data.meta.totalCount);
        }
      } catch (error) {
        console.error("Error fetching products count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update stats with actual product count
  const updatedStats = statsData.map((stat) =>
    stat.title === "Total Produk"
      ? { ...stat, value: loading ? "Loading..." : productCount.toString() }
      : stat
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Selamat datang di panel admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {updatedStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href={stat.link}
              className="block p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border-t border-gray-200"
            >
              <div className="flex justify-between items-center">
                <span>Lihat Detail</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID Pesanan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pelanggan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Jumlah
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrdersData.map((order) => {
                const statusStyle = getStatusStyles(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <statusStyle.icon className="h-3 w-3 mr-1" />
                        {statusStyle.label}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {recentOrdersData.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 text-sm">Belum ada pesanan</p>
          </div>
        )}
      </div>
    </div>
  );
}
