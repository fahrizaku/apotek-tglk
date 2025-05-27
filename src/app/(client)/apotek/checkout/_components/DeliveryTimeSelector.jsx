//file: src/components/checkout/DeliveryTimeSelector.jsx
import { AlertCircle } from "lucide-react";
import { deliveryTimeOptions } from "@/data/checkoutData";
import { formatPrice } from "@/utils/formatPrice";

export default function DeliveryTimeSelector({
  formData,
  errors,
  handleInputChange,
  selectedArea,
  shippingCost,
  expressCost,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Waktu Pengiriman *
      </label>

      <div className="space-y-3">
        {deliveryTimeOptions.map((option) => {
          const isAvailable = option.available;

          // Calculate total cost for this delivery option
          let totalCost = shippingCost;
          let expressFee = 0;

          if (option.id === "secepatnya" && selectedArea) {
            expressFee = selectedArea.expressCost;
            totalCost = expressFee; // For express, show only express cost
          }

          return (
            <label
              key={option.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                !isAvailable
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : formData.deliveryTime === option.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                value={option.id}
                checked={formData.deliveryTime === option.id}
                onChange={(e) =>
                  handleInputChange("deliveryTime", e.target.value)
                }
                disabled={!isAvailable}
                className="sr-only"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <div
                      className={`font-medium ${
                        !isAvailable ? "text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {option.name}
                    </div>
                    <div
                      className={`text-sm ${
                        !isAvailable ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {!isAvailable ? (
                        "Tidak tersedia saat ini"
                      ) : (
                        <>
                          {option.description}
                          {formData.area && (
                            <span className="block mt-1">
                              {option.id === "regular" ? (
                                <>
                                  Ongkir:{" "}
                                  {totalCost === 0
                                    ? "GRATIS"
                                    : formatPrice(totalCost)}
                                </>
                              ) : (
                                <>Biaya Express: {formatPrice(totalCost)}</>
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-auto">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    !isAvailable
                      ? "border-gray-300 bg-gray-200"
                      : formData.deliveryTime === option.id
                      ? "border-green-500 bg-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {formData.deliveryTime === option.id && isAvailable && (
                    <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {errors.deliveryTime && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.deliveryTime}
        </p>
      )}
    </div>
  );
}
