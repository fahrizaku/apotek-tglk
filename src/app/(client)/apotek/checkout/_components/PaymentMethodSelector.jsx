//file: src/components/checkout/PaymentMethodSelector.jsx
import { CreditCard } from "lucide-react";
import { paymentMethods } from "@/data/checkoutData";

export default function PaymentMethodSelector({ formData, handleInputChange }) {
  return (
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
                <div className="font-medium text-gray-800">{method.name}</div>
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
  );
}
