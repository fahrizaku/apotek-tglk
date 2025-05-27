"use client";
//file: src/app/(client)/apotek/checkout/page.jsx
import { useState, useEffect } from "react";
import { ArrowLeft, Package, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useCheckoutHistory } from "@/hooks/useCheckoutHistory";
import CustomerForm from "./_components/CustomerForm";
import PaymentMethodSelector from "./_components/PaymentMethodSelector";
import OrderSummary from "./_components/OrderSummary";
import {
  areaData,
  deliveryTimeOptions,
  paymentMethods,
} from "@/data/checkoutData";
import { formatPrice } from "@/utils/formatPrice";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const { saveNameToHistory, saveAreaToHistory } = useCheckoutHistory();

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    deliveryTime: "regular",
    notes: "",
    paymentMethod: "cod",
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [expressCost, setExpressCost] = useState(0);
  const [selectedArea, setSelectedArea] = useState(null);
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
      const area = areaData.find((area) => area.name === formData.area);
      if (area) {
        setShippingCost(area.cost);
        setExpressCost(area.expressCost);
        setSelectedArea(area);

        const expressOption = deliveryTimeOptions.find(
          (option) => option.id === "secepatnya"
        );
        const isExpressGloballyAvailable = expressOption?.available || false;

        if (
          !isExpressGloballyAvailable &&
          formData.deliveryTime === "secepatnya"
        ) {
          setFormData((prev) => ({ ...prev, deliveryTime: "regular" }));
        }
      }
    } else {
      setShippingCost(0);
      setExpressCost(0);
      setSelectedArea(null);
    }
  }, [formData.area]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save name and area to history before creating order
      if (formData.name.trim()) {
        saveNameToHistory(formData.name.trim());
      }
      if (formData.area.trim()) {
        saveAreaToHistory(formData.area.trim());
      }

      const orderData = {
        id: `ORD-${Date.now()}`,
        items: items,
        customer: formData,
        subtotal: getCartTotal(),
        shippingCost: deliveryTotalCost,
        total: getCartTotal() + deliveryTotalCost,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("apotek-orders") || "[]"
      );
      existingOrders.push(orderData);
      localStorage.setItem("apotek-orders", JSON.stringify(existingOrders));

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
Subtotal: ${formatPrice(getCartTotal())}
${formData.deliveryTime === "secepatnya" ? "Biaya Express" : "Ongkos Kirim"}: ${
        deliveryTotalCost === 0 ? "GRATIS" : formatPrice(deliveryTotalCost)
      }
Total: ${formatPrice(getCartTotal() + deliveryTotalCost)}

Metode Bayar: ${
        formData.paymentMethod === "cod"
          ? "Bayar di Tempat (COD)"
          : "Transfer Bank"
      }

Mohon konfirmasi pesanan ini. Terima kasih! 🙏`;

      const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappUrl, "_blank");

      clearCart();
      setShowSuccess(true);

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
  const deliveryTotalCost =
    formData.deliveryTime === "secepatnya" ? expressCost : shippingCost;
  const total = subtotal + deliveryTotalCost;

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
          <CustomerForm
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            selectedArea={selectedArea}
            shippingCost={shippingCost}
            expressCost={expressCost}
          />

          <PaymentMethodSelector
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryTotalCost={deliveryTotalCost}
            total={total}
            formData={formData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
