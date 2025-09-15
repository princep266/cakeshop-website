import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { saveCartToFirebase, getCartFromFirebase } from '../firebase/database';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        coupon: null,
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || [],
      };

    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.payload,
      };

    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children, currentUser }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    coupon: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    if (!currentUser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Check if this is compressed data (missing image field)
          if (parsedCart.length > 0 && !parsedCart[0].image) {
            console.log('Loading compressed cart data from localStorage');
            // This is compressed data, we'll need to restore full product info later
            dispatch({ type: 'LOAD_CART', payload: parsedCart });
          } else {
            console.log('Loading full cart data from localStorage');
            dispatch({ type: 'LOAD_CART', payload: parsedCart });
          }
        } catch (error) {
          console.error('Error parsing saved cart:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [currentUser]);

  // Load cart from Firebase when user logs in
  useEffect(() => {
    const loadCartFromFirebase = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          console.log('Loading cart from Firebase for user:', currentUser.uid);
          
          // Get cart from Firebase
          const result = await getCartFromFirebase(currentUser.uid);
          
          // Get any existing cart from localStorage
          const localCart = localStorage.getItem('cart');
          let localCartItems = [];
          
          if (localCart) {
            try {
              localCartItems = JSON.parse(localCart);
              console.log('Found local cart items:', localCartItems);
            } catch (error) {
              console.error('Error parsing local cart:', error);
              localStorage.removeItem('cart');
            }
          }
          
          if (result.success) {
            const firebaseCart = result.cart || [];
            console.log('Cart loaded from Firebase:', firebaseCart);
            
            // Merge Firebase cart with local cart, prioritizing Firebase
            let mergedCart = [...firebaseCart];
            
            // Add local cart items that aren't already in Firebase cart
            localCartItems.forEach(localItem => {
              const existingItem = mergedCart.find(item => item.id === localItem.id);
              if (existingItem) {
                // If item exists in both, use the higher quantity
                existingItem.quantity = Math.max(existingItem.quantity, localItem.quantity);
              } else {
                // If item only exists locally, add it
                mergedCart.push(localItem);
              }
            });
            
            console.log('Merged cart:', mergedCart);
            
            // Update state with merged cart
            dispatch({ type: 'LOAD_CART', payload: mergedCart });
            
            // Save merged cart back to Firebase
            if (mergedCart.length > 0) {
              await saveCartToFirebase(currentUser.uid, mergedCart);
            }
            
            // Clear localStorage since we're now using Firebase
            localStorage.removeItem('cart');
          } else {
            console.error('Failed to load cart from Firebase:', result.error);
            // Fallback to localStorage if Firebase fails
            if (localCartItems.length > 0) {
              // Check if local cart is compressed and needs decompression
              if (localCartItems.length > 0 && !localCartItems[0].image) {
                console.log('Local cart is compressed, attempting to restore full product info');
                // For now, just load the compressed data - full restoration can be done later
                dispatch({ type: 'LOAD_CART', payload: localCartItems });
              } else {
                dispatch({ type: 'LOAD_CART', payload: localCartItems });
              }
            }
          }
        } catch (error) {
          console.error('Error loading cart from Firebase:', error);
          // Fallback to localStorage if Firebase fails
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              // Check if this is compressed data
              if (parsedCart.length > 0 && !parsedCart[0].image) {
                console.log('Loading compressed cart data from localStorage as fallback');
                dispatch({ type: 'LOAD_CART', payload: parsedCart });
              } else {
                console.log('Loading full cart data from localStorage as fallback');
                dispatch({ type: 'LOAD_CART', payload: parsedCart });
              }
            } catch (error) {
              console.error('Error parsing saved cart:', error);
              localStorage.removeItem('cart');
            }
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCartFromFirebase();
  }, [currentUser]);

  // Save cart to localStorage and Firebase whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (currentUser) {
        // Save to Firebase if user is authenticated
        try {
          if (state.items.length > 0) {
            console.log('Saving cart to Firebase:', state.items);
            const result = await saveCartToFirebase(currentUser.uid, state.items);
            if (!result.success) {
              console.error('Failed to save cart to Firebase:', result.error);
              // Fallback to localStorage if Firebase fails
              try {
                const compressedCart = compressCartData(state.items);
                localStorage.setItem('cart', JSON.stringify(compressedCart));
                console.log('Cart saved to localStorage (compressed) as fallback');
              } catch (storageError) {
                console.error('Error saving compressed cart to localStorage:', storageError);
              }
            }
          } else {
            // Clear cart from Firebase if empty
            console.log('Clearing cart from Firebase');
            await saveCartToFirebase(currentUser.uid, []);
          }
        } catch (error) {
          console.error('Error saving cart to Firebase:', error);
          // Fallback to localStorage if Firebase fails
          try {
            const compressedCart = compressCartData(state.items);
            localStorage.setItem('cart', JSON.stringify(compressedCart));
            console.log('Cart saved to localStorage (compressed) as fallback');
          } catch (storageError) {
            console.error('Error saving compressed cart to localStorage:', storageError);
          }
        }
      } else {
        // Save to localStorage for non-authenticated users (compressed)
        try {
          const compressedCart = compressCartData(state.items);
          localStorage.setItem('cart', JSON.stringify(compressedCart));
        } catch (error) {
          console.error('Error saving compressed cart to localStorage:', error);
        }
      }
    };

    // Debounce cart saving to avoid too many Firebase calls
    const timeoutId = setTimeout(saveCart, 500);
    return () => clearTimeout(timeoutId);
  }, [state.items, currentUser]);

  // Save cart before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser && state.items.length > 0) {
        // Try to save to Firebase first
        try {
          // Use a synchronous approach for beforeunload
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/save-cart', false); // Synchronous request
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({ userId: currentUser.uid, cart: state.items }));
        } catch (error) {
          console.log('Could not save to Firebase before unload, using localStorage');
        }
        
        // Always save to localStorage as backup
        try {
          const compressedCart = compressCartData(state.items);
          localStorage.setItem('cart', JSON.stringify(compressedCart));
        } catch (error) {
          console.error('Error saving compressed cart to localStorage before unload:', error);
        }
      } else if (!currentUser && state.items.length > 0) {
        // Save to localStorage for non-authenticated users
        try {
          const compressedCart = compressCartData(state.items);
          localStorage.setItem('cart', JSON.stringify(compressedCart));
        } catch (error) {
          console.error('Error saving compressed cart to localStorage before unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, state.items]);

  // Handle logout - save cart to localStorage
  useEffect(() => {
    if (currentUser === null && state.items.length > 0) {
      console.log('User logged out, saving cart to localStorage:', state.items);
      try {
        const compressedCart = compressCartData(state.items);
        localStorage.setItem('cart', JSON.stringify(compressedCart));
        console.log('Cart saved to localStorage (compressed) after logout');
      } catch (error) {
        console.error('Error saving compressed cart to localStorage after logout:', error);
      }
    }
  }, [currentUser, state.items]);

  // Sync cart when user returns to the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser && state.items.length > 0) {
        console.log('User returned to app, syncing cart...');
        syncCart();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, state.items]);

  // Sync cart when network connection is restored
  useEffect(() => {
    const handleOnline = () => {
      if (currentUser && state.items.length > 0) {
        console.log('Network connection restored, syncing cart...');
        syncCart();
      }
    };

    const handleOffline = () => {
      if (currentUser && state.items.length > 0) {
        console.log('Network connection lost, saving cart to localStorage...');
        try {
          const compressedCart = compressCartData(state.items);
          localStorage.setItem('cart', JSON.stringify(compressedCart));
          console.log('Cart saved to localStorage (compressed) due to offline status');
        } catch (error) {
          console.error('Error saving compressed cart to localStorage:', error);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser, state.items]);

  // Handle auth state changes
  useEffect(() => {
    if (currentUser) {
      // User is authenticated, migrate any local cart data
      migrateLocalCartToFirebase();
    }
  }, [currentUser]);

  // Handle app lifecycle events
  useEffect(() => {
    const handleAppStateChange = (event) => {
      if (event.type === 'blur' || event.type === 'focus') {
        if (currentUser && state.items.length > 0) {
          console.log('App state changed, syncing cart...');
          syncCart();
        }
      }
    };

    // Listen for app state changes (for mobile apps)
    if (document.addEventListener) {
      document.addEventListener('blur', handleAppStateChange);
      document.addEventListener('focus', handleAppStateChange);
    }

    return () => {
      if (document.removeEventListener) {
        document.removeEventListener('blur', handleAppStateChange);
        document.removeEventListener('focus', handleAppStateChange);
      }
    };
  }, [currentUser, state.items]);

  // Periodic cleanup and maintenance
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Clean up old cart data every 5 minutes
      cleanupOldCartData();
      
      // Validate and clean cart data every 5 minutes
      validateAndCleanCart();
      
      // Check storage quota every 10 minutes
      if (Date.now() % 600000 < 300000) { // Every 10 minutes
        const quotaStatus = checkStorageQuota();
        if (!quotaStatus.available) {
          console.warn('Storage quota warning:', quotaStatus.message);
        }
      }
    }, 300000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Coupon functions
  const applyCoupon = (couponCode) => {
    // Define available coupons
    const availableCoupons = {
      'WELCOME10': { code: 'WELCOME10', discount: 10, type: 'percentage', minAmount: 0, description: '10% off your first order' },
      'SAVE20': { code: 'SAVE20', discount: 20, type: 'percentage', minAmount: 50, description: '20% off orders above ₹50' },
      'FLAT50': { code: 'FLAT50', discount: 50, type: 'fixed', minAmount: 100, description: '₹50 off orders above ₹100' },
      'FREESHIP': { code: 'FREESHIP', discount: 5.99, type: 'shipping', minAmount: 30, description: 'Free shipping on orders above ₹30' },
      'HOLIDAY15': { code: 'HOLIDAY15', discount: 15, type: 'percentage', minAmount: 25, description: '15% off holiday special' }
    };

    const coupon = availableCoupons[couponCode.toUpperCase()];
    if (coupon) {
      const subtotal = getCartTotal();
      if (subtotal >= coupon.minAmount) {
        dispatch({ type: 'APPLY_COUPON', payload: coupon });
        return { success: true, coupon, message: `Coupon applied! ${coupon.description}` };
      } else {
        return { 
          success: false, 
          message: `Minimum order amount of ₹${coupon.minAmount} required for this coupon` 
        };
      }
    } else {
      return { success: false, message: 'Invalid coupon code' };
    }
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
    return { success: true, message: 'Coupon removed' };
  };

  const getCouponDiscount = () => {
    if (!state.coupon) return 0;
    
    const subtotal = getCartTotal();
    if (subtotal < state.coupon.minAmount) return 0;
    
    switch (state.coupon.type) {
      case 'percentage':
        return (subtotal * state.coupon.discount) / 100;
      case 'fixed':
        return Math.min(state.coupon.discount, subtotal);
      case 'shipping':
        return subtotal >= 50 ? 0 : state.coupon.discount; // Free shipping if order >= 50
      default:
        return 0;
    }
  };

  const syncCart = async () => {
    if (currentUser && state.items.length > 0) {
      try {
        console.log('Syncing cart to Firebase:', state.items);
        await saveCartToFirebase(currentUser.uid, state.items);
        console.log('Cart synced successfully');
        return { success: true };
      } catch (error) {
        console.error('Error syncing cart:', error);
        // Fallback to localStorage
        try {
          localStorage.setItem('cart', JSON.stringify(state.items));
          console.log('Cart saved to localStorage as fallback');
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
          // If both Firebase and localStorage fail, we can't persist the cart
          return { success: false, error: 'Failed to persist cart data' };
        }
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  };

  const isCartSynced = () => {
    if (!currentUser) return true; // Non-authenticated users always use localStorage
    return true; // For now, assume synced. Could be enhanced with actual sync status tracking
  };

  const recoverCart = async () => {
    if (currentUser) {
      try {
        console.log('Attempting to recover cart from Firebase...');
        const result = await getCartFromFirebase(currentUser.uid);
        if (result.success && result.cart && result.cart.length > 0) {
          console.log('Cart recovered from Firebase:', result.cart);
          dispatch({ type: 'LOAD_CART', payload: result.cart });
          return { success: true, cart: result.cart };
        }
        return { success: false, message: 'No cart data found' };
      } catch (error) {
        console.error('Error recovering cart:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, message: 'User not authenticated' };
  };

  const migrateLocalCartToFirebase = async () => {
    if (currentUser) {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const localCartItems = JSON.parse(localCart);
          if (localCartItems.length > 0) {
            console.log('Migrating local cart to Firebase:', localCartItems);
            const result = await saveCartToFirebase(currentUser.uid, localCartItems);
            if (result.success) {
              console.log('Local cart migrated to Firebase successfully');
              localStorage.removeItem('cart');
              return { success: true, cart: localCartItems };
            }
          }
        } catch (error) {
          console.error('Error migrating local cart:', error);
        }
      }
    }
    return { success: false, message: 'No local cart to migrate' };
  };

  const handleAuthStateChange = async (user) => {
    if (user) {
      // User logged in, migrate local cart to Firebase
      console.log('User logged in, checking for local cart to migrate...');
      await migrateLocalCartToFirebase();
    } else {
      // User logged out, save current cart to localStorage
      if (state.items.length > 0) {
        console.log('User logged out, saving cart to localStorage:', state.items);
        try {
          localStorage.setItem('cart', JSON.stringify(state.items));
        } catch (error) {
          console.error('Error saving cart to localStorage:', error);
        }
      }
    }
  };

  const checkStorageQuota = () => {
    try {
      // Check if localStorage is available and has space
      const testKey = '__cart_storage_test__';
      const testData = 'x'.repeat(1024); // 1KB test data
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return { available: true, message: 'Storage available' };
    } catch (error) {
      console.error('Storage quota exceeded or localStorage not available:', error);
      return { available: false, message: 'Storage quota exceeded' };
    }
  };

  const cleanupOldCartData = () => {
    try {
      // Remove any corrupted or old cart data
      const keys = Object.keys(localStorage);
      const cartKeys = keys.filter(key => key.startsWith('cart') && key !== 'cart');
      cartKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('Cleaned up old cart key:', key);
        } catch (error) {
          console.error('Error cleaning up cart key:', key, error);
        }
      });
    } catch (error) {
      console.error('Error during cart cleanup:', error);
    }
  };

  const compressCartData = (cartItems) => {
    try {
      // Remove unnecessary fields to reduce storage size
      return cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        shopId: item.shopId || 'shop-1'
        // Remove image, description, and other large fields for storage
      }));
    } catch (error) {
      console.error('Error compressing cart data:', error);
      return cartItems; // Return original if compression fails
    }
  };

  const decompressCartData = (compressedItems, fullProductData) => {
    try {
      // Restore full product data from compressed items
      return compressedItems.map(compressedItem => {
        const fullProduct = fullProductData.find(p => p.id === compressedItem.id);
        if (fullProduct) {
          return {
            ...fullProduct,
            quantity: compressedItem.quantity
          };
        }
        return compressedItem; // Return compressed item if full product not found
      });
    } catch (error) {
      console.error('Error decompressing cart data:', error);
      return compressedItems; // Return compressed if decompression fails
    }
  };

  const restoreFullProductInfo = async () => {
    if (state.items.length > 0 && !state.items[0].image) {
      try {
        console.log('Restoring full product information for compressed cart items');
        // Import products data dynamically to avoid circular dependencies
        const { products } = await import('../data/products.js');
        const restoredCart = decompressCartData(state.items, products);
        dispatch({ type: 'LOAD_CART', payload: restoredCart });
        console.log('Full product information restored');
        return { success: true, cart: restoredCart };
      } catch (error) {
        console.error('Error restoring full product information:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: true, message: 'Cart already has full product information' };
  };

  const validateAndCleanCart = () => {
    try {
      const validItems = state.items.filter(item => {
        // Check if item has required fields
        if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          console.warn('Removing invalid cart item:', item);
          return false;
        }
        
        // Check if quantity is positive
        if (item.quantity <= 0) {
          console.warn('Removing item with invalid quantity:', item);
          return false;
        }
        
        // Check if price is positive
        if (item.price < 0) {
          console.warn('Removing item with invalid price:', item);
          return false;
        }
        
        return true;
      });
      
      if (validItems.length !== state.items.length) {
        console.log('Cleaned cart items:', validItems.length, 'of', state.items.length, 'items valid');
        dispatch({ type: 'LOAD_CART', payload: validItems });
        return { success: true, removedCount: state.items.length - validItems.length };
      }
      
      return { success: true, message: 'All cart items are valid' };
    } catch (error) {
      console.error('Error validating cart:', error);
      return { success: false, error: error.message };
    }
  };

  const exportCartData = () => {
    try {
      const cartData = {
        items: state.items,
        exportDate: new Date().toISOString(),
        totalItems: state.items.length,
        totalValue: getCartTotal(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(cartData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cart-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      return { success: true, message: 'Cart data exported successfully' };
    } catch (error) {
      console.error('Error exporting cart data:', error);
      return { success: false, error: error.message };
    }
  };

  const importCartData = (file) => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate imported data structure
            if (!importedData.items || !Array.isArray(importedData.items)) {
              resolve({ success: false, error: 'Invalid cart data format' });
              return;
            }
            
            // Validate each item
            const validItems = importedData.items.filter(item => {
              return item.id && item.name && typeof item.price === 'number' && typeof item.quantity === 'number';
            });
            
            if (validItems.length === 0) {
              resolve({ success: false, error: 'No valid items found in backup' });
              return;
            }
            
            // Merge with existing cart (add new items, update quantities for existing ones)
            const existingItems = [...state.items];
            const newItems = [];
            
            validItems.forEach(importedItem => {
              const existingIndex = existingItems.findIndex(item => item.id === importedItem.id);
              if (existingIndex >= 0) {
                // Item exists, update quantity (add to existing)
                existingItems[existingIndex].quantity += importedItem.quantity;
              } else {
                // New item, add to new items
                newItems.push(importedItem);
              }
            });
            
            const mergedCart = [...existingItems, ...newItems];
            dispatch({ type: 'LOAD_CART', payload: mergedCart });
            
            console.log('Cart data imported successfully:', {
              existingItems: existingItems.length,
              newItems: newItems.length,
              totalItems: mergedCart.length
            });
            
            resolve({ 
              success: true, 
              message: 'Cart data imported successfully',
              existingItems: existingItems.length,
              newItems: newItems.length,
              totalItems: mergedCart.length
            });
            
          } catch (parseError) {
            console.error('Error parsing imported cart data:', parseError);
            resolve({ success: false, error: 'Invalid JSON format in backup file' });
          }
        };
        
        reader.onerror = () => {
          resolve({ success: false, error: 'Error reading backup file' });
        };
        
        reader.readAsText(file);
        
      } catch (error) {
        console.error('Error importing cart data:', error);
        resolve({ success: false, error: error.message });
      }
    });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    coupon: state.coupon,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCouponDiscount,
    syncCart,
    isCartSynced,
    recoverCart,
    migrateLocalCartToFirebase,
    handleAuthStateChange,
    checkStorageQuota,
    cleanupOldCartData,
    compressCartData,
    decompressCartData,
    restoreFullProductInfo,
    validateAndCleanCart,
    exportCartData,
    importCartData,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
