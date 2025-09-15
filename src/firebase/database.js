import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';

// Utility function to validate user authentication and order ownership
const validateUserAndOrder = (userId, orderData) => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    console.error('No authenticated user found');
    return { valid: false, error: 'User not authenticated' };
  }
  
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid userId provided:', userId);
    return { valid: false, error: 'Invalid user ID' };
  }
  
  if (currentUser.uid !== userId) {
    console.error(`User ${currentUser.uid} trying to access orders for user ${userId}`);
    return { valid: false, error: 'Unauthorized access' };
  }
  
  if (orderData && orderData.userId && orderData.userId !== userId) {
    console.error(`Order userId ${orderData.userId} doesn't match requested userId ${userId}`);
    return { valid: false, error: 'Order ownership mismatch' };
  }
  
  return { valid: true, currentUser };
};

// Generate unique tracking ID
const generateTrackingId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TRK-${timestamp}-${randomStr}`.toUpperCase();
};

// Products Collection Functions
export const addProduct = async (productData) => {
  try {
    // Optimize the data structure for faster writes
    const optimizedProductData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      subcategory: productData.subcategory || '',
      image: productData.image || '',
      ingredients: productData.ingredients || '',
      allergens: productData.allergens || '',
      preparationTime: productData.preparationTime || '',
      servingSize: productData.servingSize || '',
      calories: productData.calories || 0,
      inventory: productData.inventory,
      inStock: productData.inStock,
      isActive: true,
      isFeatured: productData.isFeatured || false,
      isSeasonal: productData.isSeasonal || false,
      tags: productData.tags || [],
      rating: 0,
      reviews: 0,
      totalSold: 0,
      averageRating: 0,
      reviewCount: 0,
      shopId: productData.shopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'products'), optimizedProductData);
    
    return { 
      success: true, 
      id: docRef.id,
      message: 'Product added successfully'
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to add product'
    };
  }
};

export const getProducts = async () => {
  try {
    const q = query(collection(db, 'products'), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, products };
  } catch (error) {
    console.error('Error getting products:', error);
    return { success: false, error: error.message };
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'products'), 
      where('category', '==', category),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, products };
  } catch (error) {
    console.error('Error getting products by category:', error);
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (productId, updateData) => {
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId) => {
  try {
    // Soft delete - mark as inactive instead of actually deleting
    await updateDoc(doc(db, 'products', productId), {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
};

// Enhanced Orders Collection Functions with Tracking
export const createOrder = async (orderData) => {
  try {
    // Delegate to saveOrder to ensure address and payment are saved in separate collections
    const result = await saveOrder(orderData);
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

export const getOrdersByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: error.message };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const orderData = { id: docSnap.id, ...docSnap.data() };
      
      // Load order items from separate collection
      try {
        const itemsQuery = query(collection(db, 'orderItems'), where('orderId', '==', orderId));
        const itemsSnapshot = await getDocs(itemsQuery);
        orderData.items = itemsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (itemsError) {
        console.warn('Failed to fetch order items:', itemsError);
      }
      
      // Fetch related address information if available
      if (orderData.addressId) {
        try {
          const addressResult = await getAddressById(orderData.addressId);
          if (addressResult.success) {
            orderData.shippingAddress = addressResult.address;
          }
        } catch (addressError) {
          console.warn('Failed to fetch address for order:', addressError);
        }
      }
      
      // Fetch related payment information if available
      if (orderData.paymentId) {
        try {
          const paymentResult = await getPaymentById(orderData.paymentId);
          if (paymentResult.success) {
            orderData.paymentInfo = paymentResult.payment;
          }
        } catch (paymentError) {
          console.warn('Failed to fetch payment for order:', paymentError);
        }
      }
      
      return { success: true, order: orderData };
    } else {
      return { success: false, error: 'Order not found' };
    }
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, error: error.message };
  }
};

export const getOrderByTrackingId = async (trackingId) => {
  try {
    console.log('Searching for order with tracking ID:', trackingId);
    
    const q = query(collection(db, 'orders'), where('trackingId', '==', trackingId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const orderDoc = querySnapshot.docs[0];
      const orderData = { id: orderDoc.id, ...orderDoc.data() };
      
      console.log('Order found by tracking ID:', orderData.id);
      
      // Load order items from separate collection
      try {
        const itemsQuery = query(collection(db, 'orderItems'), where('orderId', '==', orderData.id));
        const itemsSnapshot = await getDocs(itemsQuery);
        orderData.items = itemsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log('Order items loaded:', orderData.items.length);
      } catch (itemsError) {
        console.warn('Failed to fetch order items:', itemsError);
        orderData.items = [];
      }
      
      // Fetch related address information if available
      if (orderData.addressId) {
        try {
          const addressResult = await getAddressById(orderData.addressId);
          if (addressResult.success) {
            orderData.shippingAddress = addressResult.address;
            console.log('Shipping address loaded');
          }
        } catch (addressError) {
          console.warn('Failed to fetch address for order:', addressError);
        }
      }
      
      // Fetch related payment information if available
      if (orderData.paymentId) {
        try {
          const paymentResult = await getPaymentById(orderData.paymentId);
          if (paymentResult.success) {
            orderData.paymentInfo = paymentResult.payment;
            console.log('Payment info loaded');
          }
        } catch (paymentError) {
          console.warn('Failed to fetch payment for order:', paymentError);
        }
      }
      
      return { success: true, order: orderData };
    } else {
      console.log('No order found with tracking ID:', trackingId);
      return { success: false, error: 'Order not found' };
    }
  } catch (error) {
    console.error('Error getting order by tracking ID:', error);
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = async (orderId, status, shopNotes = '', estimatedDelivery = null) => {
  try {
    console.log('updateOrderStatus called with:', { orderId, status, shopNotes, estimatedDelivery });
    
    if (!orderId) {
      console.error('updateOrderStatus: orderId is required');
      return { success: false, error: 'Order ID is required' };
    }
    
    const orderRef = doc(db, 'orders', orderId);
    console.log('Order reference created for:', orderId);
    
    const orderDoc = await getDoc(orderRef);
    console.log('Order document fetched, exists:', orderDoc.exists());
    
    if (!orderDoc.exists()) {
      console.error('updateOrderStatus: Order not found in database:', orderId);
      return { success: false, error: 'Order not found' };
    }

    const orderData = orderDoc.data();
    console.log('Order data from database:', orderData);
    
    const timeline = orderData.timeline || [];
    
    // Add new status to timeline (avoid serverTimestamp inside arrays)
    const timelineEntry = {
      step: status,
      status: 'completed',
      timestamp: new Date(),
      description: `Order status updated to ${status}`,
      updatedBy: 'shop'
    };

    // Only add shop notes to timeline if they exist
    if (shopNotes && shopNotes.trim() !== '') {
      timelineEntry.description = `${shopNotes} - Order status updated to ${status}`;
    }

    timeline.push(timelineEntry);

    const updateData = {
      status,
      orderStatus: status,
      timeline,
      updatedAt: serverTimestamp()
    };

    // Only add shopNotes if it has a valid value
    if (shopNotes && shopNotes.trim() !== '') {
      updateData.shopNotes = shopNotes;
    } else if (orderData.shopNotes && orderData.shopNotes.trim() !== '') {
      updateData.shopNotes = orderData.shopNotes;
    }

    // Add estimated delivery time if provided
    if (estimatedDelivery && estimatedDelivery.trim() !== '') {
      updateData.estimatedDelivery = estimatedDelivery;
      updateData.estimatedDeliverySetBy = 'shop';
      updateData.estimatedDeliverySetAt = serverTimestamp();
    }

    // Clean up any undefined or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    console.log('Final update data (cleaned):', updateData);

    console.log('Updating order document with data:', updateData);
    await updateDoc(orderRef, updateData);
    console.log('Order document updated successfully');

    // Update delivery tracking if order is confirmed
    if (status === 'confirmed') {
      console.log('Order confirmed, updating delivery tracking...');
      await updateDeliveryTracking(orderId, 'confirmed');
      console.log('Delivery tracking updated');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};

// Delivery Tracking Functions
// Enhanced order confirmation with estimated delivery time
export const confirmOrderWithDeliveryTime = async (orderId, estimatedDelivery, shopNotes = '') => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const orderData = orderDoc.data();
    const timeline = orderData.timeline || [];
    
    // Add confirmation to timeline
    timeline.push({
      step: 'confirmed',
      status: 'completed',
      timestamp: new Date(),
      description: `Order confirmed by shop. Estimated delivery: ${estimatedDelivery}`,
      updatedBy: 'shop'
    });

    // Prepare update data
    const updateData = {
      status: 'confirmed',
      orderStatus: 'confirmed',
      confirmedAt: serverTimestamp(),
      estimatedDelivery,
      estimatedDeliverySetBy: 'shop',
      estimatedDeliverySetAt: serverTimestamp(),
      timeline,
      updatedAt: serverTimestamp()
    };

    // Only add shopNotes if it has a valid value
    if (shopNotes && shopNotes.trim() !== '') {
      updateData.shopNotes = shopNotes;
    } else if (orderData.shopNotes && orderData.shopNotes.trim() !== '') {
      updateData.shopNotes = orderData.shopNotes;
    }

    // Clean up any undefined or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    console.log('Final confirmation update data (cleaned):', updateData);

    // Update order with confirmation and estimated delivery
    await updateDoc(orderRef, updateData);

    // Update delivery tracking
    await updateDeliveryTracking(orderId, 'confirmed');

    return { success: true, message: 'Order confirmed successfully with estimated delivery time' };
  } catch (error) {
    console.error('Error confirming order:', error);
    return { success: false, error: error.message };
  }
};

export const updateDeliveryTracking = async (orderId, status, location = '', notes = '') => {
  try {
    const q = query(collection(db, 'deliveryTracking'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const trackingDoc = querySnapshot.docs[0];
      const trackingData = trackingDoc.data();
      const deliveryUpdates = trackingData.deliveryUpdates || [];
      
      deliveryUpdates.push({
        status,
        location: location || trackingData.currentLocation,
        timestamp: new Date(),
        description: notes || `Delivery status updated to ${status}`
      });

      await updateDoc(doc(db, 'deliveryTracking', trackingDoc.id), {
        status,
        currentLocation: location || trackingData.currentLocation,
        deliveryUpdates,
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating delivery tracking:', error);
    return { success: false, error: error.message };
  }
};

export const getDeliveryTracking = async (orderId) => {
  try {
    const q = query(collection(db, 'deliveryTracking'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const trackingDoc = querySnapshot.docs[0];
      return { success: true, tracking: { id: trackingDoc.id, ...trackingDoc.data() } };
    } else {
      return { success: false, error: 'Tracking information not found' };
    }
  } catch (error) {
    console.error('Error getting delivery tracking:', error);
    return { success: false, error: error.message };
  }
};

// Shop Management Functions
export const getShopOrders = async (shopId) => {
  try {
    console.log('Fetching orders for shop ID:', shopId);
    
    // Get orders from the 'orders' collection
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(
      ordersRef,
      where('shopId', '==', shopId)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    console.log(`Found ${ordersSnapshot.size} orders for shop ${shopId}`);
    
    const orders = [];
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort in memory instead of in the query
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    // Fetch address and payment information for each order
    const ordersWithDetails = [];
    for (const order of orders) {
      const orderWithDetails = { ...order };
      
      // Fetch address information if available
      if (order.addressId) {
        try {
          const addressResult = await getAddressById(order.addressId);
          if (addressResult.success) {
            orderWithDetails.shippingAddress = addressResult.address;
          }
        } catch (addressError) {
          console.warn(`Failed to fetch address for order ${order.id}:`, addressError);
        }
      }
      
      // Fetch payment information if available
      if (order.paymentId) {
        try {
          const paymentResult = await getPaymentById(order.paymentId);
          if (paymentResult.success) {
            orderWithDetails.paymentInfo = paymentResult.payment;
          }
        } catch (paymentError) {
          console.warn(`Failed to fetch payment for order ${order.id}:`, paymentError);
        }
      }
      
      ordersWithDetails.push(orderWithDetails);
    }
    
    console.log(`Returning ${ordersWithDetails.length} orders with details for shop ${shopId}`);
    return {
      success: true,
      orders: ordersWithDetails
    };
  } catch (error) {
    console.error('Error getting shop orders:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch shop orders',
      orders: []
    };
  }
};

export const getShopProducts = async (shopId) => {
  try {
    const q = query(collection(db, 'products'), where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, products };
  } catch (error) {
    console.error('Error getting shop products:', error);
    return { success: false, error: error.message };
  }
};

// Order Confirmation Functions
export const confirmOrder = async (orderId, confirmationData) => {
  try {
    const batch = writeBatch(db);
    
    // Update order status
    const orderRef = doc(db, 'orders', orderId);
    batch.update(orderRef, {
      status: 'confirmed',
      orderStatus: 'confirmed',
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      confirmationNotes: confirmationData.notes || '',
      estimatedDelivery: confirmationData.estimatedDelivery || null
    });

    // Update delivery tracking
    const q = query(collection(db, 'deliveryTracking'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const trackingDoc = querySnapshot.docs[0];
      const trackingData = trackingDoc.data();
      const deliveryUpdates = trackingData.deliveryUpdates || [];
      
      deliveryUpdates.push({
        status: 'confirmed',
        location: 'Shop',
        timestamp: new Date(),
        description: 'Order confirmed and being prepared'
      });

      batch.update(doc(db, 'deliveryTracking', trackingDoc.id), {
        status: 'confirmed',
        currentLocation: 'Shop',
        deliveryUpdates,
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error confirming order:', error);
    return { success: false, error: error.message };
  }
};

// Product Inventory Management
export const updateProductInventory = async (productId, quantity, operation = 'decrease') => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return { success: false, error: 'Product not found' };
    }

    const productData = productDoc.data();
    const currentInventory = productData.inventory || 0;
    let newInventory;

    if (operation === 'decrease') {
      newInventory = Math.max(0, currentInventory - quantity);
    } else {
      newInventory = currentInventory + quantity;
    }

    await updateDoc(productRef, {
      inventory: newInventory,
      inStock: newInventory > 0,
      updatedAt: serverTimestamp()
    });

    return { success: true, newInventory };
  } catch (error) {
    console.error('Error updating product inventory:', error);
    return { success: false, error: error.message };
  }
};

// Reviews Collection Functions
export const addReview = async (reviewData) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update product rating
    await updateProductRating(reviewData.productId, reviewData.rating);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }
};

export const updateProductRating = async (productId, newRating) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return { success: false, error: 'Product not found' };
    }

    const productData = productDoc.data();
    const currentRating = productData.averageRating || 0;
    const currentCount = productData.reviewCount || 0;
    
    const newCount = currentCount + 1;
    const newAverageRating = ((currentRating * currentCount) + newRating) / newCount;

    await updateDoc(productRef, {
      averageRating: newAverageRating,
      reviewCount: newCount,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating product rating:', error);
    return { success: false, error: error.message };
  }
};

export const getReviewsByProduct = async (productId) => {
  try {
    const q = query(
      collection(db, 'reviews'), 
      where('productId', '==', productId)
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return { success: true, reviews };
  } catch (error) {
    console.error('Error getting reviews by product:', error);
    return { success: false, error: error.message };
  }
};

export const getAllReviews = async () => {
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, reviews };
  } catch (error) {
    console.error('Error getting all reviews:', error);
    return { success: false, error: error.message };
  }
};

// Cart Collection Functions (for persistent cart across devices)
export const saveCartToFirebase = async (userId, cartItems) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      cart: cartItems,
      cartUpdatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving cart:', error);
    return { success: false, error: error.message };
  }
};

export const getCartFromFirebase = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { success: true, cart: userData.cart || [] };
    }
    return { success: true, cart: [] };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const listenToOrders = (userId, callback) => {
  try {
    console.log('Setting up real-time listener for orders for user:', userId);
    
    // Listen to orders collection
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(
      ordersRef,
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
      try {
        const orders = [];
        
        // Process each order and fetch related data
        for (const doc of snapshot.docs) {
          const orderData = { id: doc.id, ...doc.data() };
          
          // Fetch address information if available
          if (orderData.addressId) {
            try {
              const addressResult = await getAddressById(orderData.addressId);
              if (addressResult.success) {
                orderData.shippingAddress = addressResult.address;
              }
            } catch (addressError) {
              console.warn(`Failed to fetch address for order ${orderData.id}:`, addressError);
            }
          }
          
          // Fetch payment information if available
          if (orderData.paymentId) {
            try {
              const paymentResult = await getPaymentById(orderData.paymentId);
              if (paymentResult.success) {
                orderData.paymentInfo = paymentResult.payment;
              }
            } catch (paymentError) {
              console.warn(`Failed to fetch payment for order ${orderData.id}:`, paymentError);
            }
          }
          
          orders.push(orderData);
        }
        
        // Sort in memory instead of in the query
        orders.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return dateB - dateA; // Descending order
        });
        
        console.log(`Real-time update: ${orders.length} orders for user ${userId}`);
        callback(orders);
      } catch (error) {
        console.error('Error processing real-time order update:', error);
        // Still call callback with empty array to prevent UI errors
        callback([]);
      }
    }, (error) => {
      console.error('Error in real-time orders listener:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    // Return a no-op function to prevent errors
    return () => {};
  }
};

export const listenToProducts = (callback) => {
  const q = query(
    collection(db, 'products'), 
    where('isActive', '==', true)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    products.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    callback(products);
  });
};

// Test Firebase connectivity
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    const testDoc = await addDoc(collection(db, 'test'), {
      test: true,
      timestamp: serverTimestamp()
    });
    console.log('Firebase connection test successful, created test doc:', testDoc.id);
    
    // Clean up test document
    await deleteDoc(testDoc);
    console.log('Test document cleaned up');
    
    return { success: true, message: 'Firebase connection working' };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

export const saveOrder = async (orderData) => {
  try {
    console.log('saveOrder called with:', orderData);
    
    // Validate required fields
    if (!orderData.userId) {
      throw new Error('userId is required');
    }
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    if (!orderData.shopId) {
      throw new Error('shopId is required');
    }
    
    // Lightweight connectivity check (read-only)
    try {
      await getDocs(query(collection(db, 'products'), limit(1)));
      console.log('Firebase read connectivity verified');
    } catch (connError) {
      console.warn('Connectivity check failed; proceeding to writes which will report precise errors:', connError?.message || connError);
    }
    
    const trackingId = generateTrackingId();
    console.log('Generated tracking ID:', trackingId);
    
    // Get shop information from the order data
    const shopId = orderData.shopId;
    console.log('Using shopId:', shopId);
    
    // Save address information to separate collection
    let addressId = null;
    if (orderData.shippingAddress) {
      try {
        const addressRef = await addDoc(collection(db, 'addresses'), {
          userId: orderData.userId,
          orderId: null, // Will be updated after order creation
          type: 'shipping',
          firstName: orderData.shippingAddress.firstName,
          lastName: orderData.shippingAddress.lastName,
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          zipCode: orderData.shippingAddress.zipCode,
          phone: orderData.contactInfo?.phone || '',
          email: orderData.contactInfo?.email || '',
          country: 'USA', // Default country
          isDefault: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        addressId = addressRef.id;
        console.log('Address saved with ID:', addressId);
      } catch (addressError) {
        console.error('Failed to save address:', addressError);
        // Don't fail the main order creation for this
      }
    }
    
    // Save payment information to separate collection
    let paymentId = null;
    if (orderData.paymentInfo) {
      try {
        const paymentRef = await addDoc(collection(db, 'payments'), {
          userId: orderData.userId,
          orderId: null, // Will be updated after order creation
          type: 'order_payment',
          cardNumber: orderData.paymentInfo.cardNumber,
          cardholderName: orderData.paymentInfo.cardholderName,
          amount: orderData.orderSummary?.total || 0,
          status: 'pending',
          paymentMethod: 'credit_card',
          currency: 'USD',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        paymentId = paymentRef.id;
        console.log('Payment info saved with ID:', paymentId);
      } catch (paymentError) {
        console.error('Failed to save payment info:', paymentError);
        // Don't fail the main order creation for this
      }
    }
    
    // Prepare the order document data (without embedded address/payment/items)
    const orderDocument = {
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      shopId: shopId,
      trackingId: trackingId,
      // Reference to separate collections instead of embedded data
      addressId: addressId,
      paymentId: paymentId,
      contactInfo: orderData.contactInfo,
      orderSummary: orderData.orderSummary,
      itemsCount: Array.isArray(orderData.items) ? orderData.items.length : 0,
      status: 'pending',
      orderStatus: 'pending',
      deliveryStatus: 'pending',
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: [
        {
          step: 'Order Placed',
          status: 'completed',
          timestamp: new Date(),
          description: 'Your order has been successfully placed'
        }
      ]
    };
    
    console.log('Creating order document with data:', orderDocument);
    console.log('Attempting to add document to orders collection...');
    
    // Create the order document
    const orderRef = await addDoc(collection(db, 'orders'), orderDocument);
    console.log('Order document created with ID:', orderRef.id);
    
    // Save items to separate collection orderItems
    try {
      if (orderData.items && Array.isArray(orderData.items)) {
        const batch = writeBatch(db);
        orderData.items.forEach((item) => {
          const itemRef = doc(collection(db, 'orderItems'));
          batch.set(itemRef, {
            orderId: orderRef.id,
            userId: orderData.userId,
            shopId: shopId,
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        console.log('Order items saved to separate collection');
      }
    } catch (itemsSaveError) {
      console.warn('Failed to save order items:', itemsSaveError);
    }
    
    // Update address and payment documents with the order ID
    if (addressId) {
      try {
        await updateDoc(doc(db, 'addresses', addressId), {
          orderId: orderRef.id,
          updatedAt: serverTimestamp()
        });
        console.log('Address document updated with order ID');
      } catch (updateError) {
        console.error('Failed to update address with order ID:', updateError);
      }
    }
    
    if (paymentId) {
      try {
        await updateDoc(doc(db, 'payments', paymentId), {
          orderId: orderRef.id,
          updatedAt: serverTimestamp()
        });
        console.log('Payment document updated with order ID');
      } catch (updateError) {
        console.error('Failed to update payment with order ID:', updateError);
      }
    }
    
    // Also create a shop order reference for easier shop management
    try {
      console.log('Creating shop order reference...');
      await addDoc(collection(db, 'shopOrders'), {
        orderId: orderRef.id,
        shopId: shopId,
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        itemsCount: Array.isArray(orderData.items) ? orderData.items.length : 0,
        trackingId: trackingId,
        orderSummary: orderData.orderSummary,
        status: 'pending',
        orderDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Shop order reference created successfully');
    } catch (shopOrderError) {
      console.warn('Failed to create shop order reference:', shopOrderError);
      // Don't fail the main order creation for this
    }

    // Create delivery tracking document to support the tracking page
    try {
      console.log('Creating delivery tracking entry...');
      await addDoc(collection(db, 'deliveryTracking'), {
        orderId: orderRef.id,
        trackingId: trackingId,
        userId: orderData.userId,
        shopId: shopId,
        status: 'pending',
        currentLocation: 'Order Processing Center',
        estimatedDelivery: null,
        deliveryUpdates: [
          {
            status: 'Order Received',
            location: 'Order Processing Center',
            timestamp: serverTimestamp(),
            description: 'Order has been received and is being processed'
          }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Delivery tracking entry created successfully');
    } catch (trackingError) {
      console.warn('Failed to create delivery tracking entry:', trackingError);
      // Do not fail the order because of tracking creation failure
    }
    
    console.log('Order saved successfully. Returning success response.');
    return {
      success: true,
      orderId: orderRef.id,
      trackingId,
      addressId,
      paymentId,
      message: 'Order saved successfully'
    };
  } catch (error) {
    console.error('Error saving order:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    
    // Return a more specific error message
    let errorMessage = 'Failed to save order';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firebase rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firebase is unavailable. Please try again later.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Firebase collection not found. Please check your configuration.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Get user orders from both orders and shopOrders collections
export const getUserOrders = async (userId) => {
  try {
    console.log('Fetching orders for user ID:', userId);
    
    // Basic validation - removed the problematic validation utility call
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided:', userId);
      return {
        success: false,
        error: 'Invalid user ID provided',
        orders: []
      };
    }
    
    // Validate userId parameter
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided:', userId);
      return {
        success: false,
        error: 'Invalid user ID provided',
        orders: []
      };
    }
    
    const orders = [];
    
    // Get orders from the 'orders' collection
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(
      ordersRef,
      where('userId', '==', userId)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    console.log(`Found ${ordersSnapshot.size} orders in 'orders' collection for user ${userId}`);
    
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Ensure each order has a trackingId
      if (!data.trackingId) {
        console.warn(`Order ${doc.id} missing trackingId, using document ID instead`);
        data.trackingId = doc.id;
      }
      
      orders.push({
        id: doc.id,
        userId: data.userId,
        ...data
      });
      console.log(`Added order: ${doc.id} with trackingId: ${data.trackingId}`);
    });
    
    // Get orders from the 'shopOrders' collection
    try {
      const shopOrdersRef = collection(db, 'shopOrders');
      const shopOrdersQuery = query(
        shopOrdersRef,
        where('userId', '==', userId)
      );
      
      const shopOrdersSnapshot = await getDocs(shopOrdersQuery);
      console.log(`Found ${shopOrdersSnapshot.size} orders in 'shopOrders' collection for user ${userId}`);
      
      // Track processed trackingIds to avoid duplicates
      const processedTrackingIds = new Set();
      
      // Add trackingIds from orders collection to processed set
      orders.forEach(order => {
        if (order.trackingId) {
          processedTrackingIds.add(order.trackingId);
        }
      });
      
      shopOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Ensure each order has a trackingId
        if (!data.trackingId) {
          console.warn(`ShopOrder ${doc.id} missing trackingId, using document ID instead`);
          data.trackingId = doc.id; // Use document ID as fallback
        }
        
        // PROPER DEDUPLICATION: Skip orders that already exist in the main orders collection
        if (!processedTrackingIds.has(data.trackingId)) {
          processedTrackingIds.add(data.trackingId);
          orders.push({
            id: doc.id,
            source: 'shopOrders',
            userId: data.userId, // Explicitly include userId for verification
            ...data
          });
          console.log(`Added order from 'shopOrders' collection: ${doc.id} with trackingId: ${data.trackingId}`);
        } else {
          // Skip duplicates - they already exist in the main orders collection
          console.log(`Skipping duplicate order with trackingId: ${data.trackingId} from 'shopOrders' collection`);
        }
      });
    } catch (shopOrdersError) {
      console.warn('Error fetching from shopOrders collection:', shopOrdersError);
      // Continue with orders from 'orders' collection
    }
    
    // FINAL VALIDATION: Ensure all orders belong to the correct user
    const validatedOrders = orders.filter(order => {
      if (order.userId !== userId) {
        console.error(`Order ${order.id} has incorrect userId: ${order.userId} for user ${userId} - removing`);
        return false;
      }
      return true;
    });
    
    // Fetch address and payment information for each order
    const ordersWithDetails = [];
    for (const order of validatedOrders) {
      const orderWithDetails = { ...order };
      
      // Fetch address information if available
      if (order.addressId) {
        try {
          const addressResult = await getAddressById(order.addressId);
          if (addressResult.success) {
            orderWithDetails.shippingAddress = addressResult.address;
          }
        } catch (addressError) {
          console.warn(`Failed to fetch address for order ${order.id}:`, addressError);
        }
      }
      
      // Fetch payment information if available
      if (order.paymentId) {
        try {
          const paymentResult = await getPaymentById(order.paymentId);
          if (paymentResult.success) {
            orderWithDetails.paymentInfo = paymentResult.payment;
          }
        } catch (paymentError) {
          console.warn(`Failed to fetch payment for order ${order.id}:`, paymentError);
        }
      }
      
      ordersWithDetails.push(orderWithDetails);
    }
    
    // Sort all orders by createdAt
    ordersWithDetails.sort((a, b) => {
      const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate()) : new Date(0);
      const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate()) : new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    console.log(`Total validated orders for user ${userId}: ${ordersWithDetails.length}`);
    console.log('All unique order trackingIds:', ordersWithDetails.map(o => o.trackingId).join(', '));
    
    // Log each order for debugging
    ordersWithDetails.forEach((order, index) => {
      console.log(`Order ${index + 1}: ID=${order.id}, userId=${order.userId}, trackingId=${order.trackingId}, source=${order.source}, isDuplicate=${order.isDuplicate || false}`);
    });
    
    // Check for duplicate trackingIds and remove them
    const trackingIdCounts = {};
    const finalOrders = [];
    const seenTrackingIds = new Set();
    
    ordersWithDetails.forEach(order => {
      const trackingId = order.trackingId;
      if (!seenTrackingIds.has(trackingId)) {
        seenTrackingIds.add(trackingId);
        finalOrders.push(order);
        trackingIdCounts[trackingId] = 1;
      } else {
        trackingIdCounts[trackingId] = (trackingIdCounts[trackingId] || 0) + 1;
        console.warn(`Removing duplicate order with trackingId: ${trackingId}`);
      }
    });
    
    const duplicateTrackingIds = Object.entries(trackingIdCounts).filter(([id, count]) => count > 1);
    if (duplicateTrackingIds.length > 0) {
      console.warn('Found and removed duplicate trackingIds:', duplicateTrackingIds);
    }
    
    console.log(`Returning ${finalOrders.length} unique orders for user ${userId}`);
    return {
      success: true,
      orders: finalOrders,
      userId: userId // Include userId in response for verification
    };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch orders',
      orders: []
    };
  }
};

// Audit function to check for data consistency issues (for admin use only)
export const auditOrdersForUserConsistency = async () => {
  try {
    console.log('Starting order audit for user consistency...');
    
    const issues = [];
    
    // Check orders collection
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    console.log(`Auditing ${ordersSnapshot.size} orders in 'orders' collection`);
    
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.userId) {
        issues.push({
          collection: 'orders',
          documentId: doc.id,
          issue: 'Missing userId field',
          data: data
        });
      }
    });
    
    // Check shopOrders collection
    try {
      const shopOrdersRef = collection(db, 'shopOrders');
      const shopOrdersSnapshot = await getDocs(shopOrdersRef);
      
      console.log(`Auditing ${shopOrdersSnapshot.size} orders in 'shopOrders' collection`);
      
      shopOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.userId) {
          issues.push({
            collection: 'shopOrders',
            documentId: doc.id,
            issue: 'Missing userId field',
            data: data
          });
        }
      });
    } catch (shopOrdersError) {
      console.warn('Error auditing shopOrders collection:', shopOrdersError);
    }
    
    console.log(`Audit complete. Found ${issues.length} potential issues:`, issues);
    
    return {
      success: true,
      issues: issues,
      totalOrdersAudited: ordersSnapshot.size,
      issuesFound: issues.length
    };
  } catch (error) {
    console.error('Error during order audit:', error);
    return {
      success: false,
      error: error.message || 'Failed to audit orders',
      issues: []
    };
  }
};

// Mock order function for testing (when Firebase is not available)
export const createMockOrder = async (orderData) => {
  const trackingId = generateTrackingId();
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    orderId: `mock-${Date.now()}`,
    trackingId,
    message: 'Mock order created successfully'
  };
};

// DEBUG FUNCTION: Get all orders for a user without any filtering (for debugging)
export const debugGetAllOrdersForUser = async (userId) => {
  try {
    console.log('=== DEBUG: Getting ALL orders for user without filtering ===');
    
    // Get all orders from orders collection
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('userId', '==', userId));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    console.log(`Found ${ordersSnapshot.size} orders in 'orders' collection for user ${userId}`);
    
    const allOrders = [];
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      allOrders.push({
        id: doc.id,
        source: 'orders',
        userId: data.userId,
        trackingId: data.trackingId || 'MISSING',
        createdAt: data.createdAt,
        status: data.status || data.orderStatus,
        rawData: data
      });
    });
    
    // Get all orders from shopOrders collection
    try {
      const shopOrdersRef = collection(db, 'shopOrders');
      const shopOrdersQuery = query(shopOrdersRef, where('userId', '==', userId));
      const shopOrdersSnapshot = await getDocs(shopOrdersQuery);
      
      console.log(`Found ${shopOrdersSnapshot.size} orders in 'shopOrders' collection for user ${userId}`);
      
      shopOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        allOrders.push({
          id: doc.id,
          source: 'shopOrders',
          userId: data.userId,
          trackingId: data.trackingId || 'MISSING',
          createdAt: data.createdAt,
          status: data.status || data.orderStatus,
          rawData: data
        });
      });
    } catch (shopOrdersError) {
      console.warn('Error fetching from shopOrders collection:', shopOrdersError);
    }
    
    console.log('=== ALL ORDERS FOUND ===');
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, order);
    });
    
    return {
      success: true,
      totalOrders: allOrders.length,
      orders: allOrders
    };
  } catch (error) {
    console.error('Error in debug function:', error);
    return {
      success: false,
      error: error.message,
      orders: []
    };
  }
};

// ===== EMPLOYEES =====
export const getEmployees = async () => {
  const snapshot = await getDocs(collection(db, 'employees'));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getShopEmployees = async (shopId) => {
  try {
    console.log('Fetching employees for shop ID:', shopId);
    
    // Simple query without orderBy to avoid index requirements
    const q = query(
      collection(db, 'employees'), 
      where('shopId', '==', shopId)
    );
    const querySnapshot = await getDocs(q);
    const employees = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    employees.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    console.log(`Found ${employees.length} employees for shop ${shopId}`);
    return { success: true, employees };
  } catch (error) {
    console.error('Error getting shop employees:', error);
    return { success: false, error: error.message };
  }
};

export const addEmployee = async (employee) => {
  await addDoc(collection(db, 'employees'), employee);
};

export const addShopEmployee = async (shopId, employeeData) => {
  try {
    const employeeWithShop = {
      ...employeeData,
      shopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'employees'), employeeWithShop);
    
    return { 
      success: true, 
      id: docRef.id,
      message: 'Employee added successfully'
    };
  } catch (error) {
    console.error('Error adding shop employee:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to add employee'
    };
  }
};

export const updateEmployee = async (id, updatedData) => {
  await updateDoc(doc(db, 'employees', id), updatedData);
};

export const updateShopEmployee = async (employeeId, updateData) => {
  try {
    await updateDoc(doc(db, 'employees', employeeId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: 'Employee updated successfully' };
  } catch (error) {
    console.error('Error updating shop employee:', error);
    return { success: false, error: error.message };
  }
};

export const deleteEmployee = async (id) => {
  await deleteDoc(doc(db, 'employees', id));
};

export const deleteShopEmployee = async (employeeId) => {
  try {
    await deleteDoc(doc(db, 'employees', employeeId));
    return { success: true, message: 'Employee deleted successfully' };
  } catch (error) {
    console.error('Error deleting shop employee:', error);
    return { success: false, error: error.message };
  }
};

// ===== INVENTORY =====
export const getInventory = async () => {
  const snapshot = await getDocs(collection(db, 'inventory'));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getShopInventory = async (shopId) => {
  try {
    console.log('Fetching inventory for shop ID:', shopId);
    
    // Simple query without orderBy to avoid index requirements
    const q = query(
      collection(db, 'inventory'), 
      where('shopId', '==', shopId)
    );
    const querySnapshot = await getDocs(q);
    const inventory = [];
    querySnapshot.forEach((doc) => {
      inventory.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    inventory.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    console.log(`Found ${inventory.length} inventory items for shop ${shopId}`);
    return { success: true, inventory };
  } catch (error) {
    console.error('Error getting shop inventory:', error);
    return { success: false, error: error.message };
  }
};

export const addInventoryItem = async (item) => {
  await addDoc(collection(db, 'inventory'), item);
};

export const addShopInventoryItem = async (shopId, itemData) => {
  try {
    const itemWithShop = {
      ...itemData,
      shopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: itemData.status || 'in_stock'
    };
    
    const docRef = await addDoc(collection(db, 'inventory'), itemWithShop);
    
    return { 
      success: true, 
      id: docRef.id,
      message: 'Inventory item added successfully'
    };
  } catch (error) {
    console.error('Error adding shop inventory item:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to add inventory item'
    };
  }
};

export const updateInventoryItem = async (id, updatedData) => {
  await updateDoc(doc(db, 'inventory', id), updatedData);
};

export const updateShopInventoryItem = async (itemId, updateData) => {
  try {
    await updateDoc(doc(db, 'inventory', itemId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: 'Inventory item updated successfully' };
  } catch (error) {
    console.error('Error updating shop inventory item:', error);
    return { success: false, error: error.message };
  }
};

export const deleteInventoryItem = async (id) => {
  await deleteDoc(doc(db, 'inventory', id));
};

export const deleteShopInventoryItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'inventory', itemId));
    return { success: true, message: 'Inventory item deleted successfully' };
  } catch (error) {
    console.error('Error deleting shop inventory item:', error);
    return { success: false, error: error.message };
  }
};

// ===== SAMPLE DATA CREATION =====
export const createSampleShopData = async (shopId) => {
  try {
    console.log('Creating sample data for shop:', shopId);
    
    // Create sample employees
    const sampleEmployees = [
      {
        name: 'John Baker',
        role: 'Head Baker',
        phone: '+1-555-0101',
        email: 'john.baker@bakery.com',
        department: 'Kitchen',
        hourlyRate: '18.50',
        startDate: '2024-01-15',
        isActive: true
      },
      {
        name: 'Sarah Cashier',
        role: 'Cashier',
        phone: '+1-555-0102',
        email: 'sarah.cashier@bakery.com',
        department: 'Front Desk',
        hourlyRate: '15.00',
        startDate: '2024-02-01',
        isActive: true
      },
      {
        name: 'Mike Manager',
        role: 'Shop Manager',
        phone: '+1-555-0103',
        email: 'mike.manager@bakery.com',
        department: 'Management',
        hourlyRate: '25.00',
        startDate: '2024-01-01',
        isActive: true
      }
    ];

    // Create sample inventory items
    const sampleInventory = [
      {
        name: 'All-Purpose Flour',
        sku: 'FLR-001',
        category: 'Ingredients',
        quantity: 50,
        unitPrice: 2.99,
        supplier: 'Local Mill Co.',
        minQuantity: 10,
        status: 'in_stock'
      },
      {
        name: 'Granulated Sugar',
        sku: 'SGR-001',
        category: 'Ingredients',
        quantity: 30,
        unitPrice: 1.99,
        supplier: 'Sweet Supply Inc.',
        minQuantity: 8,
        status: 'in_stock'
      },
      {
        name: 'Fresh Eggs',
        sku: 'EGG-001',
        category: 'Ingredients',
        quantity: 120,
        unitPrice: 0.25,
        supplier: 'Farm Fresh Eggs',
        minQuantity: 24,
        status: 'in_stock'
      },
      {
        name: 'Vanilla Extract',
        sku: 'VNL-001',
        category: 'Ingredients',
        quantity: 5,
        unitPrice: 8.99,
        supplier: 'Premium Flavors',
        minQuantity: 3,
        status: 'low_stock'
      },
      {
        name: 'Baking Pans',
        sku: 'PAN-001',
        category: 'Equipment',
        quantity: 15,
        unitPrice: 12.99,
        supplier: 'Kitchen Supply Co.',
        minQuantity: 5,
        status: 'in_stock'
      }
    ];

    // Add employees
    const employeePromises = sampleEmployees.map(employee => 
      addShopEmployee(shopId, employee)
    );
    const employeeResults = await Promise.all(employeePromises);
    
    // Add inventory items
    const inventoryPromises = sampleInventory.map(item => 
      addShopInventoryItem(shopId, item)
    );
    const inventoryResults = await Promise.all(inventoryPromises);

    console.log('Sample data created successfully');
    return {
      success: true,
      message: 'Sample data created successfully',
      employees: employeeResults,
      inventory: inventoryResults
    };
  } catch (error) {
    console.error('Error creating sample data:', error);
    return { success: false, error: error.message };
  }
};

// ===== SHOP ANALYTICS =====
export const getShopAnalytics = async (shopId) => {
  try {
    // Get all shop data for analytics
    const [ordersResult, productsResult, employeesResult, inventoryResult] = await Promise.all([
      getShopOrders(shopId),
      getShopProducts(shopId),
      getShopEmployees(shopId),
      getShopInventory(shopId)
    ]);

    if (!ordersResult.success || !productsResult.success || !employeesResult.success || !inventoryResult.success) {
      throw new Error('Failed to fetch shop data for analytics');
    }

    const orders = ordersResult.orders || [];
    const products = productsResult.products || [];
    const employees = employeesResult.employees || [];
    const inventory = inventoryResult.inventory || [];

    // Calculate analytics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(order.status?.toLowerCase())
    ).length;
    const completedOrders = orders.filter(order => 
      ['ready', 'delivered'].includes(order.status?.toLowerCase())
    ).length;
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.orderSummary?.total || order.total || 0;
      return sum + (typeof orderTotal === 'number' ? orderTotal : parseFloat(orderTotal) || 0);
    }, 0);
    
    // Get unique customers
    const uniqueCustomers = new Set(orders.map(order => order.userId));
    const activeCustomers = uniqueCustomers.size;
    
    // Calculate today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
      return orderDate >= today;
    }).length;

    // Calculate weekly performance
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
      return orderDate >= weekAgo;
    }).length;

    const weeklyRevenue = orders.filter(order => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
      return orderDate >= weekAgo;
    }).reduce((sum, order) => {
      const orderTotal = order.orderSummary?.total || order.total || 0;
      return sum + (typeof orderTotal === 'number' ? orderTotal : parseFloat(orderTotal) || 0);
    }, 0);

    // Inventory analytics
    const lowStockItems = inventory.filter(item => 
      (item.quantity || 0) <= (item.minQuantity || 5)
    ).length;

    const outOfStockItems = inventory.filter(item => 
      (item.quantity || 0) <= 0
    ).length;

    // Employee analytics
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    const totalEmployees = employees.length;

    return {
      success: true,
      analytics: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          today: todayOrders,
          weekly: weeklyOrders
        },
        revenue: {
          total: parseFloat(totalRevenue.toFixed(2)),
          weekly: parseFloat(weeklyRevenue.toFixed(2))
        },
        customers: {
          active: activeCustomers,
          unique: uniqueCustomers.size
        },
        inventory: {
          total: inventory.length,
          lowStock: lowStockItems,
          outOfStock: outOfStockItems
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees
        },
        products: {
          total: products.length,
          active: products.filter(p => p.isActive).length
        }
      }
    };
  } catch (error) {
    console.error('Error getting shop analytics:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch shop analytics'
    };
  }
};

// ===== ADDRESSES =====
export const getAddressById = async (addressId) => {
  try {
    const addressRef = doc(db, 'addresses', addressId);
    const addressSnap = await getDoc(addressRef);
    
    if (addressSnap.exists()) {
      return { success: true, address: { id: addressSnap.id, ...addressSnap.data() } };
    } else {
      return { success: false, error: 'Address not found' };
    }
  } catch (error) {
    console.error('Error getting address:', error);
    return { success: false, error: error.message };
  }
};

export const getAddressesByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'addresses'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const addresses = [];
    querySnapshot.forEach((doc) => {
      addresses.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    addresses.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return { success: true, addresses };
  } catch (error) {
    console.error('Error getting addresses:', error);
    return { success: false, error: error.message };
  }
};

export const updateAddress = async (addressId, updateData) => {
  try {
    const addressRef = doc(db, 'addresses', addressId);
    await updateDoc(addressRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: 'Address updated successfully' };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAddress = async (addressId) => {
  try {
    await deleteDoc(doc(db, 'addresses', addressId));
    return { success: true, message: 'Address deleted successfully' };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: error.message };
  }
};

// ===== PAYMENTS =====
export const getPaymentById = async (paymentId) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (paymentSnap.exists()) {
      return { success: true, payment: { id: paymentSnap.id, ...paymentSnap.data() } };
    } else {
      return { success: false, error: 'Payment not found' };
    }
  } catch (error) {
    console.error('Error getting payment:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const payments = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in the query
    payments.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return { success: true, payments };
  } catch (error) {
    console.error('Error getting payments:', error);
    return { success: false, error: error.message };
  }
};

export const updatePaymentStatus = async (paymentId, status, additionalData = {}) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status,
      ...additionalData,
      updatedAt: serverTimestamp()
    });
    return { success: true, message: 'Payment status updated successfully' };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error: error.message };
  }
};

export const deletePayment = async (paymentId) => {
  try {
    await deleteDoc(doc(db, 'payments', paymentId));
    return { success: true, message: 'Payment deleted successfully' };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { success: false, error: error.message };
  }
};

// ===== MIGRATION FUNCTIONS =====
export const migrateOrderToSeparateCollections = async (orderId) => {
  try {
    console.log(`Starting migration for order: ${orderId}`);
    
    // Get the order
    const orderResult = await getOrderById(orderId);
    if (!orderResult.success) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const order = orderResult.order;
    
    // Check if order already has separate collections
    if (order.addressId && order.paymentId) {
      console.log(`Order ${orderId} already migrated to separate collections`);
      return { success: true, message: 'Order already migrated' };
    }
    
    let addressId = null;
    let paymentId = null;
    
    // Migrate address if it exists embedded in the order
    if (order.shippingAddress && !order.addressId) {
      try {
        const addressRef = await addDoc(collection(db, 'addresses'), {
          userId: order.userId,
          orderId: orderId,
          type: 'shipping',
          firstName: order.shippingAddress.firstName || '',
          lastName: order.shippingAddress.lastName || '',
          address: order.shippingAddress.address || '',
          city: order.shippingAddress.city || '',
          state: order.shippingAddress.state || '',
          zipCode: order.shippingAddress.zipCode || '',
          isDefault: false,
          createdAt: order.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        addressId = addressRef.id;
        console.log(`Created address document for order ${orderId}: ${addressId}`);
      } catch (addressError) {
        console.error(`Failed to migrate address for order ${orderId}:`, addressError);
      }
    }
    
    // Migrate payment if it exists embedded in the order
    if (order.paymentInfo && !order.paymentId) {
      try {
        const paymentRef = await addDoc(collection(db, 'payments'), {
          userId: order.userId,
          orderId: orderId,
          type: 'order_payment',
          cardNumber: order.paymentInfo.cardNumber || '',
          cardholderName: order.paymentInfo.cardholderName || '',
          amount: order.orderSummary?.total || 0,
          status: 'pending',
          createdAt: order.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        paymentId = paymentRef.id;
        console.log(`Created payment document for order ${orderId}: ${paymentId}`);
      } catch (paymentError) {
        console.error(`Failed to migrate payment for order ${orderId}:`, paymentError);
      }
    }
    
    // Update the order with references to separate collections
    if (addressId || paymentId) {
      const updateData = {};
      if (addressId) updateData.addressId = addressId;
      if (paymentId) updateData.paymentId = paymentId;
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(doc(db, 'orders', orderId), updateData);
      console.log(`Updated order ${orderId} with collection references`);
    }
    
    console.log(`Migration completed for order ${orderId}`);
    return {
      success: true,
      message: 'Order migrated successfully',
      addressId,
      paymentId
    };
  } catch (error) {
    console.error(`Error migrating order ${orderId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const migrateAllOrdersToSeparateCollections = async () => {
  try {
    console.log('Starting migration of all orders to separate collections...');
    
    // Get all orders
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    console.log(`Found ${ordersSnapshot.size} orders to migrate`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of ordersSnapshot.docs) {
      try {
        const result = await migrateOrderToSeparateCollections(doc.id);
        results.push({ orderId: doc.id, ...result });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error migrating order ${doc.id}:`, error);
        results.push({ orderId: doc.id, success: false, error: error.message });
        errorCount++;
      }
    }
    
    console.log(`Migration completed. Success: ${successCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      totalOrders: ordersSnapshot.size,
      successCount,
      errorCount,
      results
    };
  } catch (error) {
    console.error('Error during bulk migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
};