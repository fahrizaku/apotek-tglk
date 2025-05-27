//file: src/components/checkout/NameInput.jsx
import { useState, useEffect, useRef } from "react";
import { AlertCircle, Clock, X } from "lucide-react";
import { useCheckoutHistory } from "@/hooks/useCheckoutHistory";

export default function NameInput({ formData, errors, handleInputChange }) {
  const { nameHistory, saveNameToHistory } = useCheckoutHistory();
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [filteredNames, setFilteredNames] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter name suggestions based on input
  useEffect(() => {
    if (formData.name.trim() === "") {
      setFilteredNames(nameHistory);
    } else {
      const filtered = nameHistory.filter(
        (name) =>
          name.toLowerCase().includes(formData.name.toLowerCase()) &&
          name !== formData.name
      );
      setFilteredNames(filtered);
    }
  }, [formData.name, nameHistory]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowNameSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNameSelect = (name) => {
    handleInputChange("name", name);
    setShowNameSuggestions(false);
  };

  const handleNameInputChange = (value) => {
    handleInputChange("name", value);
    setShowNameSuggestions(true);
  };

  const handleNameInputFocus = () => {
    if (nameHistory.length > 0) {
      setShowNameSuggestions(true);
    }
  };

  const handleNameInputBlur = (e) => {
    // Save name to history when user finishes typing (on blur)
    const name = e.target.value.trim();
    if (name) {
      saveNameToHistory(name);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nama *
      </label>
      <input
        ref={inputRef}
        type="text"
        value={formData.name}
        onChange={(e) => handleNameInputChange(e.target.value)}
        onFocus={handleNameInputFocus}
        onBlur={handleNameInputBlur}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
          errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
        placeholder="Masukkan nama"
        autoComplete="off"
      />

      {/* Name Suggestions Dropdown */}
      {showNameSuggestions && filteredNames.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {formData.name.trim() === "" && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Nama yang pernah digunakan
            </div>
          )}
          {filteredNames.map((name, index) => (
            <div
              key={index}
              onClick={() => handleNameSelect(name)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{name}</span>
                {formData.name.trim() === "" && (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.name && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.name}
        </p>
      )}
    </div>
  );
}
