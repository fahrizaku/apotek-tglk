//file: src/(client)/apotek/checkout/_components/OrderSummary.jsx
import Image from "next/image";
import { MapPin, AlertCircle } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

export default function OrderSummary({
  items,
  subtotal,
  deliveryTotalCost,
  total,
  formData,
  isSubmitting,
  handleSubmit,
}) {
  return (
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
            Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            item)
          </span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {formData.deliveryTime === "secepatnya"
              ? "Biaya Express"
              : "Ongkos Kirim"}
          </span>
          <span className="font-medium">
            {deliveryTotalCost === 0
              ? "GRATIS"
              : formatPrice(deliveryTotalCost)}
          </span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between font-semibold text-base">
          <span>Total Pembayaran</span>
          <span className="text-green-600">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Validation Warning */}
      {(!formData.name.trim() || !formData.area) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">
                Lengkapi data untuk melanjutkan:
              </p>
              <ul className="space-y-1">
                {!formData.name.trim() && (
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                    Nama wajib diisi
                  </li>
                )}
                {!formData.area && (
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                    Pilih daerah tujuan
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !formData.name.trim() || !formData.area}
        className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Memproses Pesanan...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488" />
            </svg>
            Buat Pesanan via WhatsApp
          </>
        )}
      </button>
    </div>
  );
}
