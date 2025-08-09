import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyADyZ0wO9TW83kAyithfuOdAbGjJd53bgk",
  authDomain: "cakeshop-cbb09.firebaseapp.com",
  projectId: "cakeshop-cbb09",
  storageBucket: "cakeshop-cbb09.firebasestorage.app",
  messagingSenderId: "545633919091",
  appId: "1:545633919091:web:01b886a0c52bbdfbea0a06",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
