import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getUserData } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in
        const userInfo = await getUserData(user.uid);
        setCurrentUser(user);
        setUserData(userInfo);
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    isAuthenticated: !!currentUser,
    isCustomer: userData?.userType === 'customer',
    isShop: userData?.userType === 'shop',
    isShopApproved: userData?.userType === 'shop' // Removed verification requirement
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
