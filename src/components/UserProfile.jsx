import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, Store, Calendar, Mail, Phone, MapPin, LogOut, Edit, ShoppingBag, Star } from 'lucide-react';
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
    navigate('/orders');
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
    navigate('/shop-dashboard');
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
      <div className="min-h-screen bg-gradient-to-br from-cake-pink/10 to-cake-cream/10 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h1>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink/10 to-cake-cream/10 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-cake-red rounded-full flex items-center justify-center">
                {isShop ? (
                  <Store className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-gray-600 flex items-center space-x-2">
                  {isShop ? (
                    <>
                      <Store className="w-4 h-4" />
                      <span>Shop Owner</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>Customer</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{loading ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{userData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{userData.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Member since {formatDate(userData.createdAt)}
                </span>
              </div>
            </div>

            {/* Shop Info (if shop owner) */}
            {isShop && userData.shopInfo && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shop Information</h3>
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{userData.shopInfo.shopName}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <span className="text-gray-700">{userData.shopInfo.shopAddress}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{userData.shopInfo.shopPhone}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order History */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <ShoppingBag className="w-6 h-6 text-cake-red" />
              <h3 className="text-lg font-semibold text-gray-800">Order History</h3>
            </div>
            <p className="text-gray-600 mb-4">View your past orders and track current deliveries</p>
            <button
              onClick={handleViewOrders}
              className="w-full bg-cake-red hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              View Orders
            </button>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-6 h-6 text-cake-red" />
              <h3 className="text-lg font-semibold text-gray-800">My Reviews</h3>
            </div>
            <p className="text-gray-600 mb-4">See your product reviews and ratings</p>
            <button
              onClick={handleViewReviews}
              className="w-full bg-cake-red hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              View Reviews
            </button>
          </div>

          {/* Shop Management (for shop owners) */}
          {isShop && (
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Store className="w-6 h-6 text-cake-red" />
                <h3 className="text-lg font-semibold text-gray-800">Shop Management</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage your products and orders</p>
              <button
                onClick={handleShopManagement}
                className="w-full bg-cake-red hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Manage Shop
              </button>
            </div>
          )}

          {/* Edit Profile */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Edit className="w-6 h-6 text-cake-red" />
              <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">Update your personal information</p>
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full bg-cake-red hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
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
