//file: src/app/(client)/apotek/cart/page.jsx
"use client";
import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Package,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemoveItem(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 ${
        isUpdating ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Image
            src={item.mediaUrl || "/placeholder-product.jpg"}
            alt={item.name}
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 text-sm sm:text-base line-clamp-2 mb-1">
            {item.name}
          </h3>

          <div className="flex flex-col gap-1 mb-3">
            {/* Price */}
            <div className="flex items-center gap-2">
              {item.discountPrice && item.discountPrice !== item.price ? (
                <>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                  <span className="font-semibold text-red-600 text-sm">
                    {formatPrice(item.price)}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-gray-800 text-sm">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>

            {/* Unit and Stock Info */}
            <div className="text-xs text-gray-500">
              per {item.unit || "kemasan"}
            </div>

            {item.stock <= 10 && (
              <div className="text-xs text-orange-500 font-medium">
                Stok tersisa {item.stock}
              </div>
            )}
          </div>

          {/* Quantity Controls and Remove */}
          <div className="flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="px-3 py-2 font-medium text-gray-800 min-w-[3rem] text-center">
                {item.quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || item.quantity >= item.stock}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Subtotal */}
          <div className="mt-2 text-right">
            <span className="font-semibold text-gray-800">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty Cart Component
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <ShoppingCart className="w-12 h-12 text-gray-400" />
    </div>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      Keranjang Kosong
    </h2>
    <p className="text-gray-500 text-center mb-6 max-w-md">
      Belum ada produk di keranjang Anda. Mari mulai berbelanja produk kesehatan
      yang Anda butuhkan.
    </p>
    <Link
      href="/products"
      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
    >
      <Package className="w-5 h-5" />
      Mulai Belanja
    </Link>
  </div>
);

// Cart Summary Component
const CartSummary = ({ items, total, onCheckout }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await onCheckout();
    } finally {
      setIsProcessing(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 sticky top-20">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Ringkasan Pesanan
      </h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Item ({itemCount})</span>
          <span className="font-medium">{formatPrice(total)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ongkos Kirim</span>
          <span className="text-green-600 font-medium">GRATIS</span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between font-semibold text-base">
          <span>Total Pembayaran</span>
          <span className="text-green-600">{formatPrice(total)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isProcessing || items.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            Checkout ({itemCount} Item)
          </>
        )}
      </button>
    </div>
  );
};

// Main Cart Page Component
export default function CartPage() {
  const {
    items,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleUpdateQuantity = async (productId, quantity) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = async (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = async () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleCheckout = async () => {
    // Here you would integrate with your checkout/payment system
    alert("Fitur checkout akan segera tersedia!");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Keranjang Belanja
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              items={items}
              total={getCartTotal()}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-2">
              Kosongkan Keranjang?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Semua item di keranjang akan dihapus. Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
