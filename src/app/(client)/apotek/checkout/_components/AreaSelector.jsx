//file: src/components/checkout/AreaSelector.jsx
import { useState, useEffect } from "react";
import { AlertCircle, X, Clock, MapPin } from "lucide-react";
import { areaData } from "@/data/checkoutData";
import { formatPrice } from "@/utils/formatPrice";
import { useCheckoutHistory } from "@/hooks/useCheckoutHistory";

export default function AreaSelector({ formData, errors, handleInputChange }) {
  const { areaHistory, saveAreaToHistory } = useCheckoutHistory();
  const [areaSearch, setAreaSearch] = useState("");
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState(areaData);

  // Initialize area search with selected area
  useEffect(() => {
    if (formData.area) {
      setAreaSearch(formData.area);
    }
  }, [formData.area]);

  // Filter and sort areas based on search and history
  useEffect(() => {
    let filtered = [];

    if (areaSearch.trim() === "") {
      // When no search term, show history first, then all areas
      const historyAreas = areaHistory
        .map((historyArea) =>
          areaData.find((area) => area.name === historyArea)
        )
        .filter(Boolean);

      const nonHistoryAreas = areaData.filter(
        (area) => !areaHistory.includes(area.name)
      );

      filtered = [...historyAreas, ...nonHistoryAreas];
    } else {
      // When searching, filter by search term but prioritize history
      const searchFiltered = areaData.filter((area) =>
        area.name.toLowerCase().includes(areaSearch.toLowerCase())
      );

      const historyAreas = searchFiltered.filter((area) =>
        areaHistory.includes(area.name)
      );

      const nonHistoryAreas = searchFiltered.filter(
        (area) => !areaHistory.includes(area.name)
      );

      filtered = [...historyAreas, ...nonHistoryAreas];
    }

    setFilteredAreas(filtered);
  }, [areaSearch, areaHistory]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = event.target.closest(".area-dropdown-container");
      if (!dropdownElement && showAreaDropdown) {
        setShowAreaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAreaDropdown]);

  // Handle area search input
  const handleAreaSearch = (value) => {
    setAreaSearch(value);
    setShowAreaDropdown(true);

    // If user is typing and it doesn't match current selection, clear the selection
    if (formData.area && value !== formData.area) {
      handleInputChange("area", "");
    }
  };

  // Handle area selection
  const handleAreaSelect = (areaName) => {
    handleInputChange("area", areaName);
    setAreaSearch(areaName);
    setShowAreaDropdown(false);

    // Save to history
    saveAreaToHistory(areaName);
  };

  // Handle area clear
  const handleAreaClear = () => {
    handleInputChange("area", "");
    handleInputChange("deliveryTime", "regular");
    setAreaSearch("");
    setShowAreaDropdown(false);
  };

  const isFromHistory = (areaName) => {
    return areaHistory.includes(areaName);
  };

  return (
    <div className="relative area-dropdown-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Daerah Tujuan *
      </label>
      <div className="relative">
        <input
          type="text"
          value={areaSearch}
          onChange={(e) => handleAreaSearch(e.target.value)}
          onFocus={() => setShowAreaDropdown(true)}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.area ? "border-red-300 bg-red-50" : "border-gray-300"
          } ${formData.area ? "pr-10" : ""}`}
          placeholder="Cari atau pilih daerah tujuan..."
          autoComplete="off"
        />

        {/* Clear button */}
        {formData.area && (
          <button
            type="button"
            onClick={handleAreaClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown untuk hasil pencarian */}
      {showAreaDropdown && filteredAreas.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* History header when no search */}
          {areaSearch.trim() === "" && areaHistory.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Daerah yang pernah dipilih
            </div>
          )}

          {filteredAreas.map((area, index) => {
            const fromHistory = isFromHistory(area.name);
            const isHistorySection = areaSearch.trim() === "" && fromHistory;

            return (
              <div key={area.name}>
                {/* Separator between history and other areas */}
                {areaSearch.trim() === "" &&
                  index > 0 &&
                  isFromHistory(filteredAreas[index - 1].name) &&
                  !fromHistory && (
                    <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Daerah lainnya
                    </div>
                  )}

                <div
                  onClick={() => handleAreaSelect(area.name)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                    formData.area === area.name
                      ? "bg-green-50 text-green-700"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {area.name}
                      </span>
                      {fromHistory && areaSearch.trim() !== "" && (
                        <Clock className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {area.cost === 0
                        ? "GRATIS"
                        : `+${formatPrice(area.cost)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pesan jika tidak ada hasil */}
      {showAreaDropdown && areaSearch && filteredAreas.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-gray-500 text-sm">Daerah tidak ditemukan</p>
        </div>
      )}

      {errors.area && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.area}
        </p>
      )}
    </div>
  );
}
