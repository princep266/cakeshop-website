import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import OrderTrackingPage from './pages/OrderTrackingPage';
import ReviewPage from './pages/ReviewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserProfile from './components/UserProfile';
import ShopDashboard from './pages/ShopDashboard';
import AddProduct from './pages/AddProduct';
import OrdersPage from './pages/OrdersPage';
import ReviewsPage from './pages/ReviewsPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/gallery" element={<ProductGalleryPage />} />
              <Route path="/pastries" element={<PastryAndSweetsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/track-order" element={<OrderTrackingPage />} />
              <Route path="/reviews" element={<ReviewPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/shop-dashboard" element={<ShopDashboard />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/my-reviews" element={<ReviewsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
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
    </AuthProvider>
  );
}

export default App;
