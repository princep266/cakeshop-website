import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, debugGetAllOrdersForUser } from '../firebase/database';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle, Truck, AlertCircle, Loader2, RefreshCw, 
  Search, Filter, Calendar, MapPin, Phone, Mail, Eye, EyeOff, 
  ShoppingBag, Star, Heart, ArrowRight, Clock3, Shield, Award
} from 'lucide-react';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const { currentUser, userData, isShop, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugResults, setDebugResults] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect users based on their role
  useEffect(() => {
    if (isShop) {
      navigate('/shop-owner-home');
      return;
    }
    
    if (isCustomer) {
      navigate('/customer-orders');
      return;
    }
  }, [isShop, isCustomer, navigate]);

  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info('Refreshing your orders...');
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      // Only fetch orders for regular customers
      if (isShop) {
        setError('Shop owners should use the Shop Dashboard to view orders');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching orders for customer:', currentUser.uid);
        console.log('Current user data:', userData);
        
        const result = await getUserOrders(currentUser.uid);
        
        if (result.success) {
          console.log(`Found ${result.orders.length} orders for customer ${currentUser.uid}`);
          console.log('Orders data:', JSON.stringify(result.orders, null, 2));
          
          // ADDITIONAL VALIDATION: Ensure all orders belong to the current user
          const validatedOrders = result.orders.filter(order => {
            if (order.userId !== currentUser.uid) {
              console.error(`Order ${order.id} has userId ${order.userId} but current user is ${currentUser.uid} - removing`);
              return false;
            }
            return true;
          });
          
          console.log(`After validation: ${validatedOrders.length} orders belong to customer ${currentUser.uid}`);
          
          // Add more detailed logging
          validatedOrders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`, {
              id: order.id,
              userId: order.userId,
              source: order.source,
              trackingId: order.trackingId,
              status: order.status,
              createdAt: order.createdAt
            });
          });
          
          setOrders(validatedOrders);
          
          if (validatedOrders.length === 0) {
            console.log('No orders found for customer');
          }
        } else {
          console.error('Failed to load orders:', result.error);
          setError(result.error || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, refreshTrigger, isShop]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock3 className="w-5 h-5 text-amber-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'ready':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleTrackOrder = (trackingId) => {
    if (trackingId) {
      navigate(`/track-order?trackingId=${trackingId}`);
    } else {
      toast.error('Tracking ID not available for this order');
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (order.orderStatus || order.status)?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Your Sweet Orders</h2>
          <p className="text-gray-600 mb-6">Gathering all your delicious cake orders...</p>
          <div className="bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-pink-700">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-700">
              💡 <strong>Don't worry!</strong> This might be a temporary issue. Try refreshing or contact our support.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={refreshOrders}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/products')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full mb-6">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            My Sweet Order History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Welcome back, <span className="font-semibold text-pink-600">{userData?.firstName || 'Valued Customer'}</span>! 
            Here's your complete journey through our delicious cakes and pastries.
          </p>
          {userData?.userType && (
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-blue-100 text-pink-800 border border-pink-200">
              <Shield className="w-4 h-4 mr-2" />
              {userData.userType === 'customer' ? 'Premium Customer' : userData.userType}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-pink-100 to-pink-200 rounded-xl">
                <ShoppingBag className="w-7 h-7 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl">
                <Clock3 className="w-7 h-7 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Awaiting Confirmation</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Being Prepared</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes((o.orderStatus || o.status)?.toLowerCase())).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <Award className="w-7 h-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your orders by ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Awaiting Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Being Prepared</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* Developer Debug Tools - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    showDebug 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="ml-2">Debug</span>
                </button>
              )}
              
              <button 
                onClick={refreshOrders}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Debug Section */}
        {showDebug && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-600" />
              Developer Debug Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">User Information</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <div>User ID: {currentUser?.uid}</div>
                  <div>User Type: {userData?.userType || 'Unknown'}</div>
                  <div>Email: {currentUser?.email}</div>
                  <div>Orders Count: {orders.length}</div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Orders Summary</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Total Orders: {orders.length}</div>
                  <div>Filtered Orders: {filteredOrders.length}</div>
                  <div>Search Term: {searchTerm || 'None'}</div>
                  <div>Status Filter: {statusFilter}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('=== ALL ORDERS WITHOUT FILTERING ===');
                  orders.forEach((order, index) => {
                    console.log(`Order ${index + 1}:`, {
                      id: order.id,
                      userId: order.userId,
                      trackingId: order.trackingId || 'MISSING',
                      source: order.source,
                      createdAt: order.createdAt,
                      status: order.status || order.orderStatus
                    });
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Log Orders to Console
              </button>
              
              {/* DEBUG: Call debugGetAllOrdersForUser function */}
              <button
                onClick={async () => {
                  try {
                    console.log('=== CALLING DEBUG FUNCTION ===');
                    const result = await debugGetAllOrdersForUser(currentUser.uid);
                    console.log('Debug function result:', result);
                    setDebugResults(result);
                    if (result.success) {
                      console.log(`Found ${result.totalOrders} total orders for user ${currentUser.uid}`);
                      result.orders.forEach((order, index) => {
                        console.log(`Debug Order ${index + 1}:`, order);
                      });
                    } else {
                      console.error('Debug function failed:', result.error);
                    }
                  } catch (error) {
                    console.error('Error calling debug function:', error);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm ml-2"
              >
                Debug: Get All Orders
              </button>
              
              <button
                onClick={() => setDebugResults(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm ml-2"
              >
                Clear Debug Results
              </button>
            </div>
            
            {/* Debug Results */}
            {debugResults && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <div className="text-sm text-purple-800">
                  <strong>Debug Function Results:</strong>
                  <br />
                  {debugResults.success ? (
                    <>
                      • Total orders found: {debugResults.totalOrders}
                      <br />
                      • Orders from 'orders' collection: {debugResults.orders.filter(o => o.source === 'orders').length}
                      <br />
                      • Orders from 'shopOrders' collection: {debugResults.orders.filter(o => o.source === 'shopOrders').length}
                      <br />
                      <strong>All Orders Details:</strong>
                      {debugResults.orders.map((order, index) => (
                        <div key={index} className="ml-4 mt-2 text-xs bg-gray-50 p-2 rounded border">
                          <strong>Order {index + 1}:</strong>
                          <br />
                          • ID: {order.id}
                          <br />
                          • Source: {order.source}
                          <br />
                          • UserID: {order.userId}
                          <br />
                          • TrackingID: {order.trackingId || 'MISSING'}
                          <br />
                          • Status: {order.status || order.orderStatus || 'N/A'}
                          <br />
                          • Created: {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'N/A'}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      • Error: {debugResults.error}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Raw Orders Data */}
        {showDebug && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Raw Orders Data</h3>
            <div className="text-sm text-yellow-800">
              <strong>Raw Orders Data:</strong> {orders.length} orders received from database
              <br />
              <strong>Orders Details:</strong>
              {orders.map((order, index) => (
                <div key={index} className="ml-4 mt-2 text-xs bg-white p-2 rounded border">
                  Order {index + 1}: ID={order.id}, userId={order.userId}, trackingId={order.trackingId || 'MISSING'}, source={order.source}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="text-8xl mb-6">🎂</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or status filter.'
                  : 'You haven\'t placed any orders yet. Start your sweet journey with us!'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
                  <p className="text-sm text-pink-700">
                    💡 <strong>New customer?</strong> Browse our delicious cakes and pastries, add items to your cart, and complete your first order to see it appear here!
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {searchTerm || statusFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/products')}
                    className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg"
                  >
                    Start Shopping
                  </button>
                )}
                <button
                  onClick={refreshOrders}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Customer Message */}
              <div className="bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Your Sweet Journey with Us
                    </h3>
                    <p className="text-blue-700">
                      Here are all your orders from our bakery. Track their progress, view delicious details, and relive your sweet moments with us! 🎂✨
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-full border border-gray-200">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </p>
                  <div className="text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-full border border-gray-200">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              {/* Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOrders.map((order, index) => {
                  // Ensure trackingId exists
                  if (!order.trackingId) {
                    console.warn(`Order ${order.id} missing trackingId, using id as fallback`);
                    order.trackingId = order.id;
                  }
                  
                  return (
                    <div key={order.trackingId || order.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                      {/* Order Header */}
                      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-pink-100 to-blue-100 rounded-xl">
                              {getStatusIcon(order.orderStatus || order.status)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                                Order #{order.trackingId || order.id}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.orderStatus || order.status)}`}>
                            {order.orderStatus || order.status || 'Unknown'}
                          </span>
                        </div>
                        
                        {/* Order Source Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
                          <Package className="w-3 h-3 mr-1" />
                          Source: {order.source || 'Unknown'}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                         {order.items && order.items.length > 0 ? (
                          <div className="space-y-3 mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <ShoppingBag className="w-5 h-5 mr-2 text-pink-500" />
                              Order Items
                            </h4>
                            {order.items.slice(0, 3).map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-100">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-sm"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity} × ${item.price?.toFixed(2) || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-gray-500 text-center bg-gray-50 py-2 rounded-lg border border-gray-200">
                                +{order.items.length - 3} more delicious items
                              </p>
                            )}
                          </div>
                        ) : (
                           <div className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                             <Package className="w-4 h-4 inline mr-2" />
                             No items embedded. Items are stored separately. Total items: {order.itemsCount ?? 0}
                           </div>
                        )}

                        {/* Order Summary */}
                        {order.orderSummary && (
                          <div className="border-t border-gray-100 pt-4 mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <Star className="w-5 h-5 mr-2 text-yellow-500" />
                              Order Summary
                            </h4>
                            <div className="space-y-2 text-sm bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-200">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">${order.orderSummary.subtotal?.toFixed(2) || 'N/A'}</span>
                              </div>
                              {order.orderSummary.shipping > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Shipping:</span>
                                  <span className="font-semibold">${order.orderSummary.shipping?.toFixed(2) || 'N/A'}</span>
                                </div>
                              )}
                              {order.orderSummary.tax > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tax:</span>
                                  <span className="font-semibold">${order.orderSummary.tax?.toFixed(2) || 'N/A'}</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-gray-200 pt-2">
                                <span className="font-bold text-gray-800">Total:</span>
                                <span className="font-bold text-lg text-pink-600">
                                  ${order.orderSummary.total?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleTrackOrder(order.trackingId)}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Track Order
                          </button>
                          
                          <button
                            onClick={() => {
                              // Navigate to order details page or show modal
                              console.log('View order details:', order);
                              toast.info('Order details feature coming soon!');
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Customer Help Section */}
        <div className="mt-12 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl shadow-lg border border-pink-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Need Help with Your Sweet Orders?</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Have questions about your order status, delivery, or need to make changes? We're here to make your experience as sweet as our cakes! 🎂✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/track-order')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <Truck className="w-5 h-5 mr-2" />
                Track Another Order
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order More Cakes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
