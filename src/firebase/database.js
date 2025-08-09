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
    const trackingId = generateTrackingId();
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      trackingId,
      status: 'pending',
      orderStatus: 'pending',
      deliveryStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: [
        {
          step: 'Order Placed',
          status: 'completed',
          timestamp: serverTimestamp(),
          description: 'Your order has been successfully placed'
        }
      ]
    });

    // Create delivery tracking entry
    await addDoc(collection(db, 'deliveryTracking'), {
      orderId: orderRef.id,
      trackingId,
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

    return { success: true, orderId: orderRef.id, trackingId };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

export const getOrdersByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
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
      return { success: true, order: { id: docSnap.id, ...docSnap.data() } };
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
    const q = query(collection(db, 'orders'), where('trackingId', '==', trackingId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const orderDoc = querySnapshot.docs[0];
      return { success: true, order: { id: orderDoc.id, ...orderDoc.data() } };
    } else {
      return { success: false, error: 'Order not found' };
    }
  } catch (error) {
    console.error('Error getting order by tracking ID:', error);
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = async (orderId, status, shopNotes = '') => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const orderData = orderDoc.data();
    const timeline = orderData.timeline || [];
    
    // Add new status to timeline
    timeline.push({
      step: status,
      status: 'completed',
      timestamp: serverTimestamp(),
      description: shopNotes || `Order status updated to ${status}`,
      updatedBy: 'shop'
    });

    await updateDoc(orderRef, {
      status,
      orderStatus: status,
      timeline,
      updatedAt: serverTimestamp(),
      shopNotes: shopNotes || orderData.shopNotes
    });

    // Update delivery tracking if order is confirmed
    if (status === 'confirmed') {
      await updateDeliveryTracking(orderId, 'confirmed');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};

// Delivery Tracking Functions
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
        timestamp: serverTimestamp(),
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
    console.log('Getting orders for shop:', shopId);
    
    // Get orders from the main orders collection
    const ordersQuery = query(
      collection(db, 'orders'), 
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = [];
    
    ordersSnapshot.forEach((doc) => {
      const orderData = { id: doc.id, ...doc.data() };
      orders.push(orderData);
    });
    
    console.log(`Found ${orders.length} orders for shop ${shopId}`);
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting shop orders:', error);
    return { success: false, error: error.message };
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
        timestamp: serverTimestamp(),
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
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
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
  const q = query(
    collection(db, 'orders'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  });
};

export const listenToProducts = (callback) => {
  const q = query(
    collection(db, 'products'), 
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    callback(products);
  });
};

// Save order to Firebase
export const saveOrder = async (orderData) => {
  try {
    console.log('saveOrder called with:', orderData);
    
    const trackingId = generateTrackingId();
    console.log('Generated tracking ID:', trackingId);
    
    // Get shop information from the first product in the order
    const shopId = orderData.shopId || 'shop-1';
    console.log('Using shopId:', shopId);
    
    console.log('Creating order document...');
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      trackingId,
      shopId,
      orderStatus: 'pending',
      deliveryStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: [
        {
          step: 'Order Placed',
          status: 'completed',
          timestamp: serverTimestamp(),
          description: 'Your order has been successfully placed'
        }
      ]
    });
    console.log('Order document created with ID:', orderRef.id);
    
    return {
      success: true,
      orderId: orderRef.id,
      trackingId,
      message: 'Order saved successfully'
    };
  } catch (error) {
    console.error('Error saving order:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Return a more specific error message
    let errorMessage = 'Failed to save order';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check your Firebase rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firebase is unavailable. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Get user orders
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      orders: orders
    };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return {
      success: false,
      error: error.message
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
