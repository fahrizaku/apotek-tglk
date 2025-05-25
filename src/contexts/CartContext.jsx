//file: src/contexts/CartContext.jsx
"use client";
import { createContext, useContext, useEffect, useReducer } from "react";

// Cart Context
const CartContext = createContext();

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CART":
      return {
        ...state,
        items: action.payload || [],
        loading: false,
      };

    case "ADD_TO_CART":
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: updatedItems,
      };

    case "UPDATE_QUANTITY":
      const updatedCartItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      return {
        ...state,
        items: updatedCartItems,
      };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  loading: true,
};

// Cart Provider Component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("apotek-cart");
      const cartItems = savedCart ? JSON.parse(savedCart) : [];
      dispatch({ type: "LOAD_CART", payload: cartItems });
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      dispatch({ type: "LOAD_CART", payload: [] });
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!state.loading) {
      try {
        localStorage.setItem("apotek-cart", JSON.stringify(state.items));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [state.items, state.loading]);

  // Helper functions
  const addToCart = (product, quantity = 1) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      originalPrice: product.price,
      discountPrice: product.discountPrice,
      mediaUrl: product.mediaUrl,
      unit: product.unit,
      stock: product.stock,
      category: product.category,
      quantity: quantity,
      addedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_TO_CART", payload: cartItem });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: productId, quantity },
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id: productId } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItem = (productId) => {
    return state.items.find((item) => item.id === productId);
  };

  const isInCart = (productId) => {
    return state.items.some((item) => item.id === productId);
  };

  const value = {
    items: state.items,
    loading: state.loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    getCartItem,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
