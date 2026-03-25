import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cart";

export const useCart = () => {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.priceCents,
          quantity
        }
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const safe = Math.max(1, Math.min(99, quantity));
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity: safe } : item)));
  };

  const clear = () => setItems([]);

  const totalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  return { items, addItem, removeItem, updateQuantity, clear, totalCents };
};
