import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Home, Cake, Heart, Truck, Star, User, Store, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase/auth';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { getCartItemCount } = useCart();
  const { currentUser, userData,isShop } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Cake },
    { name: 'Gallery', path: '/gallery', icon: Heart },
    
    { name: 'Track Order', path: '/track-order', icon: Truck },
    { name: 'Reviews', path: '/reviews', icon: Star },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        toast.success(result.message);
        navigate('/');
        setIsProfileOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-medium sticky top-0 z-50 border-b border-gray-100">
      <div className="max-width-container container-padding">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🎂</div>
            <div className="text-xl font-bold text-cake-brown group-hover:text-cake-red transition-colors duration-300">
              The Noisy Cake Shop
            </div>
          </Link>

          {/* Desktop Navigation - Hide for shop owners */}
          {!isShop && (
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 bg-white ${
                      isActive(item.path)
                        ? 'text-cake-red bg-cake-pink shadow-soft'
                        : 'text-gray-700 hover:text-cake-red hover:bg-cake-pink/50 hover:shadow-soft'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon - Only show when logged in */}
            {currentUser && (
              <Link
                to="/cart"
                className="relative p-3 text-gray-700 hover:text-cake-red hover:bg-cake-pink/50 rounded-xl transition-all duration-300 group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cake-red text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-medium animate-pulse">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-cake-red hover:bg-cake-pink/50 transition-all duration-300 rounded-xl hover:shadow-soft group"
                  >
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium group-hover:scale-110 transition-transform duration-300">
                      {isShop ? (
                        <Store className="w-5 h-5 text-black" />
                      ) : (
                        <User className="w-5 h-5 text-black" />
                      )}
                    </div>
                    <span className="hidden xl:block text-sm font-medium">
                      {userData?.firstName || 'User'}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-strong border border-gray-100 py-3 z-50 animate-in slide-in-from-top-2 duration-200"  >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {userData?.firstName} {userData?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {isShop ? 'Shop Owner' : 'Customer'}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-cake-pink/50 hover:text-cake-red transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        {isShop && (
                          <Link
                            to="/shop-owner-home"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-cake-pink/50 hover:text-cake-red transition-all duration-200"
                          >
                            <Store className="w-4 h-4" />
                            <span>Shop Dashboard</span>
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-cake-red font-medium text-sm px-4 py-2 rounded-xl hover:bg-cake-pink/50 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button - Hide for shop owners */}
            {!isShop && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 text-gray-700 hover:text-cake-red hover:bg-cake-red/50 rounded-xl transition-all duration-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Hide for shop owners */}
        {isMenuOpen && !isShop && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive(item.path)
                        ? 'text-cake-red bg-cake-pink shadow-soft'
                        : 'text-gray-700 hover:text-cake-red hover:bg-cake-pink/50 hover:shadow-soft'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Show cart link for logged in users, login prompt for others */}
              {currentUser ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-cake-red hover:bg-cake-pink/50 hover:shadow-soft transition-all duration-300"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart ({getCartItemCount()})</span>
                  </Link>

                </>
              ) : (
                <div className="px-4 py-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Login to access cart and place orders</p>
                  <div className="flex space-x-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 btn-primary text-sm px-4 py-2.5 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 btn-secondary text-sm px-4 py-2.5 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
