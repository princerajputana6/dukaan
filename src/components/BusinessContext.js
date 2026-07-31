"use client";

import { createContext, useContext, useMemo } from "react";

const BusinessContext = createContext(null);

export function BusinessProvider({ business, children }) {
  const value = useMemo(() => {
    const isFood = business?.type === "food";
    return {
      business,
      isFood,
      labels: {
        // Food businesses talk about a "menu" and "items"; retail about "inventory".
        inventory: isFood ? "Menu" : "Inventory",
        item: isFood ? "item" : "product",
        items: isFood ? "items" : "products",
        Item: isFood ? "Item" : "Product",
        addItem: isFood ? "Add Item" : "Add Product",
      },
    };
  }, [business]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

// Safe to call outside a provider — falls back to retail wording.
export function useBusiness() {
  return (
    useContext(BusinessContext) || {
      business: null,
      isFood: false,
      labels: {
        inventory: "Inventory",
        item: "product",
        items: "products",
        Item: "Product",
        addItem: "Add Product",
      },
    }
  );
}
