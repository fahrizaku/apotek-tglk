//file: src/components/checkout/CustomerForm.jsx
import { User, AlertCircle, X } from "lucide-react";
import AreaSelector from "./AreaSelector";
import DeliveryTimeSelector from "./DeliveryTimeSelector";
import NameInput from "./NameInput";

export default function CustomerForm({
  formData,
  errors,
  handleInputChange,
  handleSubmit,
  selectedArea,
  shippingCost,
  expressCost,
}) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Informasi Pemesan
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input with History */}
        <NameInput
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        {/* Area Selector with History */}
        <AreaSelector
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        {/* Delivery Time Selector */}
        {formData.area && (
          <DeliveryTimeSelector
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            selectedArea={selectedArea}
            shippingCost={shippingCost}
            expressCost={expressCost}
          />
        )}

        {/* Notes Field */}
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
  );
}
