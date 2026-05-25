import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('uni_cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Gagal memuat keranjang dari localStorage:', error);
      return [];
    }
  });

  // Sinkronisasi ke localStorage setiap kali cartItems berubah
  useEffect(() => {
    localStorage.setItem('uni_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Tambah produk ke keranjang
  const addToCart = (produk, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === produk.id);
      
      if (existingItemIndex > -1) {
        // Jika produk sudah ada di keranjang, update kuantitasnya
        const newItems = [...prevItems];
        const existingItem = newItems[existingItemIndex];
        const updatedQty = existingItem.qty + quantity;
        
        // Batasi berdasarkan stok produk
        newItems[existingItemIndex] = {
          ...existingItem,
          qty: Math.min(updatedQty, produk.stok),
        };
        return newItems;
      } else {
        // Jika produk belum ada, tambahkan produk baru
        return [...prevItems, { ...produk, qty: Math.min(quantity, produk.stok) }];
      }
    });
  };

  // Update kuantitas produk secara langsung
  const updateQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          // Batasi kuantitas baru agar tidak melebihi stok yang tersedia
          return { ...item, qty: Math.min(newQty, item.stok) };
        }
        return item;
      })
    );
  };

  // Hapus produk dari keranjang
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Kosongkan keranjang
  const clearCart = () => {
    setCartItems([]);
  };

  // Jumlah total item unik di keranjang
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Total harga belanja (sebelum biaya tambahan)
  const cartTotal = cartItems.reduce((total, item) => total + Number(item.harga) * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
