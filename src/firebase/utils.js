import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

// Helper function to get direct image URLs from popular hosting services
export const getImageUrlFromService = (service, url) => {
  switch (service) {
    case 'imgur':
      // Convert imgur.com links to direct image links
      return url.replace('imgur.com', 'i.imgur.com') + '.jpg';
    case 'google-drive':
      // Convert Google Drive sharing links to direct image links
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : url;
    case 'dropbox':
      // Convert Dropbox sharing links to direct image links
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    case 'github':
      // Convert GitHub raw links
      return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    default:
      return url;
  }
};

// Validate image URL
export const validateImageUrl = (url) => {
  if (!url) return true; // Allow empty URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Test image URL accessibility
export const testImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Generate order ID
export const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
};

// Format price
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date.toDate();
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

// Calculate order total
export const calculateOrderTotal = (items, taxRate = 0.08, deliveryFee = 5.99, freeDeliveryThreshold = 50) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generate tracking status
export const generateTrackingSteps = (status) => {
  const allSteps = [
    { id: 1, name: 'Order Placed', description: 'Your order has been received' },
    { id: 2, name: 'Preparing', description: 'Your order is being prepared' },
    { id: 3, name: 'Baking', description: 'Your items are being baked' },
    { id: 4, name: 'Quality Check', description: 'Quality control and packaging' },
    { id: 5, name: 'Out for Delivery', description: 'Your order is on the way' },
    { id: 6, name: 'Delivered', description: 'Order delivered successfully' }
  ];
  
  const statusMap = {
    'pending': 1,
    'confirmed': 2,
    'preparing': 2,
    'baking': 3,
    'ready': 4,
    'out_for_delivery': 5,
    'delivered': 6,
    'cancelled': 0
  };
  
  const currentStep = statusMap[status] || 1;
  
  return allSteps.map(step => ({
    ...step,
    completed: step.id <= currentStep,
    current: step.id === currentStep
  }));
};

// Search products
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm) return products;
  
  const term = searchTerm.toLowerCase();
  
  return products.filter(product =>
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term)
  );
};

// Filter products
export const filterProducts = (products, filters) => {
  let filtered = [...products];
  
  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(product => 
      product.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // Filter by price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter(product => 
      product.price >= min && product.price <= max
    );
  }
  
  // Filter by rating
  if (filters.minRating) {
    filtered = filtered.filter(product => 
      product.rating >= filters.minRating
    );
  }
  
  // Filter by availability
  if (filters.inStock) {
    filtered = filtered.filter(product => product.inStock);
  }
  
  return filtered;
};

// Sort products
export const sortProducts = (products, sortBy) => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:
      return sorted;
  }
};
