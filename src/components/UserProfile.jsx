import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, Store, Calendar, Mail, Phone, MapPin, LogOut, Edit, ShoppingBag, Star, Shield, Award, Settings, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { currentUser, userData, isCustomer, isShop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await signOutUser();
      if (result.success) {
        toast.success(result.message);
        navigate('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = () => {
    if (!currentUser) {
      toast.error('Please log in to view your orders');
      navigate('/login');
      return;
    }
    if (isCustomer) {
      navigate('/customer-orders');
    } else {
      navigate('/orders');
    }
  };

  const handleViewReviews = () => {
    if (!currentUser) {
      toast.error('Please log in to view your reviews');
      navigate('/login');
      return;
    }
    navigate('/reviews');
  };

  const handleShopManagement = () => {
    if (!currentUser || !isShop) {
      toast.error('Shop management is only available for shop owners');
      return;
    }
    navigate('/shop-owner-home');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!currentUser || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Please log in to view your profile and manage your account.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-cake-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center shadow-lg">
                {isShop ? (
                  <Store className="w-10 h-10 text-white" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {userData.firstName} {userData.lastName}
                </h1>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                    {isShop ? (
                      <>
                        <Store className="w-4 h-4 text-cake-red" />
                        <span className="text-sm font-semibold text-gray-700">Shop Owner</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-cake-red" />
                        <span className="text-sm font-semibold text-gray-700">Customer</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center space-x-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">{loading ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-6 h-6 text-cake-red mr-3" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-cake-red/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cake-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email Address</p>
                    <p className="text-gray-800 font-semibold">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-cake-red/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-cake-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                    <p className="text-gray-800 font-semibold">{userData.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-cake-red/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cake-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Member Since</p>
                    <p className="text-gray-800 font-semibold">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Info (if shop owner) */}
            {isShop && userData.shopInfo && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Store className="w-6 h-6 text-cake-red mr-3" />
                  Shop Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-cake-red/10 rounded-full flex items-center justify-center">
                      <Store className="w-5 h-5 text-cake-red" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Shop Name</p>
                      <p className="text-gray-800 font-semibold">{userData.shopInfo.shopName}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-cake-red/10 rounded-full flex items-center justify-center mt-1">
                      <MapPin className="w-5 h-5 text-cake-red" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Shop Address</p>
                      <p className="text-gray-800 font-semibold">{userData.shopInfo.shopAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-cake-red/10 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-cake-red" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Shop Phone</p>
                      <p className="text-gray-800 font-semibold">{userData.shopInfo.shopPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Order History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cake-red to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cake-red group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Order History</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              View your past orders and track current deliveries with real-time updates.
            </p>
            <button
              onClick={handleViewOrders}
              className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              View Orders
            </button>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cake-red to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <Star className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cake-red group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">My Reviews</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              See your product reviews and ratings. Share your experience with others.
            </p>
            <button
              onClick={handleViewReviews}
              className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              View Reviews
            </button>
          </div>

          {/* Shop Management (for shop owners) */}
          {isShop && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cake-red to-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cake-red group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Shop Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage your products, orders, and shop settings from one central dashboard.
              </p>
              <button
                onClick={handleShopManagement}
                className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Manage Shop
              </button>
            </div>
          )}

          {/* Edit Profile */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cake-red to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cake-red group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Edit Profile</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Update your personal information, contact details, and account preferences.
            </p>
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
