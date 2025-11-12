import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductGalleryPage from './pages/ProductGalleryPage';
import PastryAndSweetsPage from './pages/PastryAndSweetsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ReviewPage from './pages/ReviewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderInvoicePage from './pages/OrderInvoicePage';
import UserProfile from './components/UserProfile';

import AddProduct from './pages/AddProduct';


import ShopOwnerHome from './pages/ShopOwnerHome';
import ShopOrdersPage from './pages/ShopOrdersPage';
import ShopAnalyticsPage from './pages/ShopAnalyticsPage';
import ShopCustomersPage from './pages/ShopCustomersPage';
import ShopSettingsPage from './pages/ShopSettingsPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EditProfilePage from './pages/EditProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const location = useLocation();
  const hideChromeRoutes = ['/order-invoice'];
  const hideChrome = hideChromeRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/gallery" element={<ProductGalleryPage />} />
          <Route path="/pastries" element={<PastryAndSweetsPage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="/order-invoice" element={<ProtectedRoute><OrderInvoicePage /></ProtectedRoute>} />
          <Route path="/track-order" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
          <Route path="/login" element={<ProtectedRoute requireAuth={false}><LoginPage /></ProtectedRoute>} />
          <Route path="/signup" element={<ProtectedRoute requireAuth={false}><SignupPage /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ProtectedRoute requireAuth={false}><ForgotPasswordPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
         
          <Route path="/add-product" element={<ProtectedRoute userType="shop"><AddProduct /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute userType="customer"><CustomerOrdersPage /></ProtectedRoute>} />
         
          <Route path="/shop-owner-home" element={<ProtectedRoute userType="shop"><ShopOwnerHome /></ProtectedRoute>} />
          <Route path="/shop-orders" element={<ProtectedRoute userType="shop"><ShopOrdersPage /></ProtectedRoute>} />
          <Route path="/shop-analytics" element={<ProtectedRoute userType="shop"><ShopAnalyticsPage /></ProtectedRoute>} />
          <Route path="/shop-customers" element={<ProtectedRoute userType="shop"><ShopCustomersPage /></ProtectedRoute>} />
          <Route path="/shop-settings" element={<ProtectedRoute userType="shop"><ShopSettingsPage /></ProtectedRoute>} />
          <Route path="/customer-orders" element={<ProtectedRoute userType="customer"><CustomerOrdersPage /></ProtectedRoute>} />
         
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      {(authProps) => (
        <CartProvider currentUser={authProps?.currentUser}>
          <Router>
            <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
          </Router>
        </CartProvider>
      )}
    </AuthProvider>
  );
}

export default App;
