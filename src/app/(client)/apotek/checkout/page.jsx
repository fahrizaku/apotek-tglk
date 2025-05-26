//file: src/app/(client)/apotek/checkout/page.jsx
"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  User,
  MessageSquare,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

// Format price helper
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Area data with shipping costs and delivery times
const areaData = [
  { name: "Krandegan", cost: 0, deliveryTime: "15-30 menit" },
  { name: "Sukorame", cost: 5000, deliveryTime: "15-30 menit" },
  { name: "Melis", cost: 5000, deliveryTime: "15-30 menit" },
  { name: "Karanganyar", cost: 8000, deliveryTime: "30 menit - 2 jam" },
  { name: "Widoro", cost: 8000, deliveryTime: "30 menit - 2 jam" },
  { name: "Ngadirenggo", cost: 10000, deliveryTime: "30 menit - 2 jam" },
  { name: "Ngetal", cost: 10000, deliveryTime: "30 menit - 2 jam" },
  { name: "Wonocoyo", cost: 12000, deliveryTime: "30 menit - 2 jam" },
  { name: "Bendorejo", cost: 12000, deliveryTime: "30 menit - 2 jam" },
];

// Payment methods
const paymentMethods = [
  {
    id: "cod",
    name: "Bayar di Tempat (COD)",
    description: "Bayar saat barang diterima",
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: "transfer",
    name: "Transfer Bank",
    description: "Transfer ke rekening apotek",
    icon: <CreditCard className="w-5 h-5" />,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    deliveryTime: "",
    notes: "",
    paymentMethod: "cod",
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [availableDeliveryTimes, setAvailableDeliveryTimes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/apotek/cart");
    }
  }, [items, router]);

  // Calculate shipping cost when area changes
  useEffect(() => {
    if (formData.area) {
      const selectedArea = areaData.find((area) => area.name === formData.area);
      if (selectedArea) {
        setShippingCost(selectedArea.cost);
        // Set available delivery times based on area
        const deliveryOptions = ["Secepatnya"];
        if (selectedArea.deliveryTime === "15-30 menit") {
          deliveryOptions.push("15-30 menit");
        } else {
          deliveryOptions.push("30 menit - 2 jam");
        }
        setAvailableDeliveryTimes(deliveryOptions);
        // Reset delivery time selection
        setFormData((prev) => ({ ...prev, deliveryTime: "" }));
      }
    } else {
      setAvailableDeliveryTimes([]);
    }
  }, [formData.area]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.area) {
      newErrors.area = "Pilih daerah tujuan";
    }

    if (!formData.deliveryTime) {
      newErrors.deliveryTime = "Pilih waktu pengiriman";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create order data
      const orderData = {
        id: `ORD-${Date.now()}`,
        items: items,
        customer: formData,
        subtotal: getCartTotal(),
        shippingCost: shippingCost,
        total: getCartTotal() + shippingCost,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage (in real app, send to API)
      const existingOrders = JSON.parse(
        localStorage.getItem("apotek-orders") || "[]"
      );
      existingOrders.push(orderData);
      localStorage.setItem("apotek-orders", JSON.stringify(existingOrders));

      // Create WhatsApp message
      const whatsappMessage = `*PESANAN BARU - TRENGGALEK APOTEK*

*Detail Pesanan:*
Order ID: ${orderData.id}
Tanggal: ${new Date().toLocaleDateString("id-ID")}

*Pelanggan:*
Nama: ${formData.name}
Daerah: ${formData.area}
Waktu Pengiriman: ${formData.deliveryTime}
${formData.notes ? `Catatan: ${formData.notes}` : ""}

*Produk yang dipesan:*
${items
  .map(
    (item) =>
      `• ${item.name} (${item.quantity}x) - ${formatPrice(
        item.price * item.quantity
      )}`
  )
  .join("\n")}

*Ringkasan:*
Subtotal: ${formatPrice(subtotal)}
Ongkos Kirim: ${shippingCost === 0 ? "GRATIS" : formatPrice(shippingCost)}
Total: ${formatPrice(total)}

Metode Bayar: ${
        formData.paymentMethod === "cod"
          ? "Bayar di Tempat (COD)"
          : "Transfer Bank"
      }

Mohon konfirmasi pesanan ini. Terima kasih! 🙏`;

      // Open WhatsApp
      const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappUrl, "_blank");

      // Clear cart
      clearCart();

      // Show success
      setShowSuccess(true);

      // Redirect after delay
      setTimeout(() => {
        router.push("/products");
      }, 3000);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = getCartTotal();
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Keranjang Kosong
          </h2>
          <p className="text-gray-500 mb-4">Tidak ada item untuk di-checkout</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Mulai Belanja
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Pesanan Berhasil Dibuat!
          </h2>
          <p className="text-gray-500 mb-4">
            WhatsApp akan terbuka untuk konfirmasi pesanan. Jika tidak terbuka
            otomatis, silakan hubungi kami manual.
          </p>
          <div className="animate-pulse text-green-600">
            Kembali ke halaman produk...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Pemesan
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daerah Tujuan *
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.area ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">Pilih daerah tujuan</option>
                  {areaData.map((area) => (
                    <option key={area.name} value={area.name}>
                      {area.name} - {area.deliveryTime}{" "}
                      {area.cost > 0 && `(+${formatPrice(area.cost)})`}
                    </option>
                  ))}
                </select>
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.area}
                  </p>
                )}
              </div>

              {availableDeliveryTimes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Pengiriman *
                  </label>
                  <select
                    value={formData.deliveryTime}
                    onChange={(e) =>
                      handleInputChange("deliveryTime", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.deliveryTime
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih waktu pengiriman</option>
                    {availableDeliveryTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryTime && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.deliveryTime}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Catatan untuk apotek (opsional)"
                />
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Metode Pembayaran
            </h2>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.paymentMethod === method.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={(e) =>
                      handleInputChange("paymentMethod", e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div>
                      <div className="font-medium text-gray-800">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        formData.paymentMethod === method.id
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.paymentMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Ringkasan Pesanan
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Image
                    src={item.mediaUrl || "/placeholder-product.jpg"}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity}x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal (
                  {items.reduce((sum, item) => sum + item.quantity, 0)} item)
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Ongkos Kirim
                </span>
                <span className="font-medium">
                  {shippingCost === 0 ? "GRATIS" : formatPrice(shippingCost)}
                </span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between font-semibold text-base">
                <span>Total Pembayaran</span>
                <span className="text-green-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses Pesanan...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488" />
                  </svg>
                  Buat Pesanan via WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
