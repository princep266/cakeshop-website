import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import { products } from '../data/products';
import { reviews } from '../data/reviews';

// Initialize products in Firestore
export const initializeProducts = async () => {
  try {
    // Check if products already exist
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    if (productsSnapshot.empty) {
      console.log('Initializing products...');
      
      for (const product of products) {
        await addDoc(collection(db, 'products'), {
          ...product,
          isActive: true,
          averageRating: product.averageRating || product.rating || 0,
          reviewCount: product.reviewCount || product.reviews || 0,
          shopId: 'default-shop', // Default shop ID
          inStock: true,
          inventory: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('Products initialized successfully!');
      return { success: true, message: 'Products initialized successfully!' };
    } else {
      console.log('Products already exist in database');
      return { success: true, message: 'Products already exist' };
    }
  } catch (error) {
    console.error('Error initializing products:', error);
    return { success: false, error: error.message };
  }
};

// Initialize reviews in Firestore
export const initializeReviews = async () => {
  try {
    // Check if reviews already exist
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    
    if (reviewsSnapshot.empty) {
      console.log('Initializing reviews...');
      
      // Get product IDs from Firestore
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productIds = [];
      productsSnapshot.forEach((doc) => {
        productIds.push(doc.id);
      });
      
      if (productIds.length === 0) {
        console.log('No products found. Initialize products first.');
        return { success: false, error: 'No products found. Initialize products first.' };
      }
      
      for (const review of reviews) {
        // Assign random product ID from existing products
        const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
        
        await addDoc(collection(db, 'reviews'), {
          ...review,
          productId: randomProductId,
          createdAt: new Date(review.date).toISOString(),
          updatedAt: new Date(review.date).toISOString()
        });
      }
      
      console.log('Reviews initialized successfully!');
      return { success: true, message: 'Reviews initialized successfully!' };
    } else {
      console.log('Reviews already exist in database');
      return { success: true, message: 'Reviews already exist' };
    }
  } catch (error) {
    console.error('Error initializing reviews:', error);
    return { success: false, error: error.message };
  }
};

// Initialize all data
export const initializeAllData = async () => {
  try {
    console.log('Starting database initialization...');
    
    const productsResult = await initializeProducts();
    if (!productsResult.success) {
      return productsResult;
    }
    
    const reviewsResult = await initializeReviews();
    if (!reviewsResult.success) {
      return reviewsResult;
    }
    
    console.log('Database initialization completed!');
    return { 
      success: true, 
      message: 'Database initialized successfully with products and reviews!' 
    };
  } catch (error) {
    console.error('Error during database initialization:', error);
    return { success: false, error: error.message };
  }
};

// Create sample categories
export const initializeCategories = async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    if (categoriesSnapshot.empty) {
      console.log('Initializing categories...');
      
      const categories = [
        {
          name: 'Cakes',
          description: 'Delicious handcrafted cakes for all occasions',
          image: '/images/categories/cakes.jpg',
          active: true
        },
        {
          name: 'Pastries',
          description: 'Fresh pastries and baked goods',
          image: '/images/categories/pastries.jpg',
          active: true
        },
        {
          name: 'Sweets',
          description: 'Sweet treats and confections',
          image: '/images/categories/sweets.jpg',
          active: true
        },
        {
          name: 'Breads',
          description: 'Freshly baked breads and rolls',
          image: '/images/categories/breads.jpg',
          active: true
        }
      ];
      
      for (const category of categories) {
        await addDoc(collection(db, 'categories'), {
          ...category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('Categories initialized successfully!');
      return { success: true, message: 'Categories initialized successfully!' };
    } else {
      console.log('Categories already exist in database');
      return { success: true, message: 'Categories already exist' };
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
    return { success: false, error: error.message };
  }
};

// Initialize shop settings
export const initializeShopSettings = async () => {
  try {
    const settingsSnapshot = await getDocs(collection(db, 'settings'));
    
    if (settingsSnapshot.empty) {
      console.log('Initializing shop settings...');
      
      const settings = {
        shopName: 'The Noisy Cake Shop',
        shopDescription: 'Premium handcrafted cakes and pastries for all your special occasions',
        shopAddress: '123 Baker Street, Sweet City, SC 12345',
        shopPhone: '+1 (555) 123-4567',
        shopEmail: 'info@noisycakeshop.com',
        businessHours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '8:00 AM - 9:00 PM',
          sunday: '10:00 AM - 6:00 PM'
        },
        deliveryRadius: 25, // miles
        minimumOrderAmount: 20,
        deliveryFee: 5.99,
        freeDeliveryThreshold: 50,
        taxRate: 0.08,
        currency: 'USD',
        isOpen: true,
        featuredProducts: [],
        socialMedia: {
          facebook: 'https://facebook.com/noisycakeshop',
          instagram: 'https://instagram.com/noisycakeshop',
          twitter: 'https://twitter.com/noisycakeshop'
        }
      };
      
      await addDoc(collection(db, 'settings'), {
        ...settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('Shop settings initialized successfully!');
      return { success: true, message: 'Shop settings initialized successfully!' };
    } else {
      console.log('Shop settings already exist in database');
      return { success: true, message: 'Shop settings already exist' };
    }
  } catch (error) {
    console.error('Error initializing shop settings:', error);
    return { success: false, error: error.message };
  }
};
