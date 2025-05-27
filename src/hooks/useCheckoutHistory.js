//file: src/hooks/useCheckoutHistory.js
import { useState, useEffect } from "react";

export function useCheckoutHistory() {
  const [nameHistory, setNameHistory] = useState([]);
  const [areaHistory, setAreaHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedNames = localStorage.getItem("apotek-checkout-names");
      const savedAreas = localStorage.getItem("apotek-checkout-areas");

      setNameHistory(savedNames ? JSON.parse(savedNames) : []);
      setAreaHistory(savedAreas ? JSON.parse(savedAreas) : []);
    } catch (error) {
      console.error("Error loading checkout history:", error);
      setNameHistory([]);
      setAreaHistory([]);
    }
  }, []);

  // Save name to history
  const saveNameToHistory = (name) => {
    if (!name || !name.trim()) return;

    const trimmedName = name.trim();

    try {
      // Remove existing occurrence and add to front (max 5 items)
      const updatedHistory = [
        trimmedName,
        ...nameHistory.filter((item) => item !== trimmedName),
      ].slice(0, 5);

      setNameHistory(updatedHistory);
      localStorage.setItem(
        "apotek-checkout-names",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("Error saving name to history:", error);
    }
  };

  // Save area to history
  const saveAreaToHistory = (area) => {
    if (!area || !area.trim()) return;

    const trimmedArea = area.trim();

    try {
      // Remove existing occurrence and add to front (max 5 items)
      const updatedHistory = [
        trimmedArea,
        ...areaHistory.filter((item) => item !== trimmedArea),
      ].slice(0, 5);

      setAreaHistory(updatedHistory);
      localStorage.setItem(
        "apotek-checkout-areas",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("Error saving area to history:", error);
    }
  };

  // Clear name history
  const clearNameHistory = () => {
    try {
      setNameHistory([]);
      localStorage.removeItem("apotek-checkout-names");
    } catch (error) {
      console.error("Error clearing name history:", error);
    }
  };

  // Clear area history
  const clearAreaHistory = () => {
    try {
      setAreaHistory([]);
      localStorage.removeItem("apotek-checkout-areas");
    } catch (error) {
      console.error("Error clearing area history:", error);
    }
  };

  // Clear all history
  const clearAllHistory = () => {
    clearNameHistory();
    clearAreaHistory();
  };

  return {
    nameHistory,
    areaHistory,
    saveNameToHistory,
    saveAreaToHistory,
    clearNameHistory,
    clearAreaHistory,
    clearAllHistory,
  };
}
