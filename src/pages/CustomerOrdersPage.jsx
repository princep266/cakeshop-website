import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, listenToOrders, getAddressById, getPaymentById } from '../firebase/database';
import { formatAddress } from '../utils/addressUtils';
import { toast } from 'react-toastify';
import {
  ShoppingBag, Package, Truck, CheckCircle, Clock, 
  Calendar, MapPin, Eye, Search, Filter, 
  Award, AlertCircle, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';

const CustomerOrdersPage = () => {
  const { currentUser, userData, isShop } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch customer orders from Firebase
  const fetchCustomerOrders = async (isRefresh = false) => {
    if (!currentUser) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const result = await getUserOrders(currentUser.uid);
      
      if (result.success) {
        // Load additional address and payment data for orders that have separate collections
        const ordersWithDetails = await Promise.all(
          result.orders.map(async (order) => {
            try {
              // If order has separate address collection reference, load the data
              if (order.addressId) {
                const addressResult = await getAddressById(order.addressId);
                if (addressResult.success) {
                  order.shippingAddressData = addressResult.address;
                }
              }
              
              // If order has separate payment collection reference, load the data
              if (order.paymentId) {
                const paymentResult = await getPaymentById(order.paymentId);
                if (paymentResult.success) {
                  order.paymentData = paymentResult.payment;
                }
              }
              
              return order;
            } catch (error) {
              console.warn('Failed to load additional data for order:', order.id, error);
              return order;
            }
          })
        );
        
        // Deduplicate orders by trackingId to prevent duplicates
        const uniqueOrders = [];
        const seenTrackingIds = new Set();
        
        ordersWithDetails.forEach(order => {
          if (order.trackingId && !seenTrackingIds.has(order.trackingId)) {
            seenTrackingIds.add(order.trackingId);
            uniqueOrders.push(order);
          } else if (!order.trackingId) {
            // If no trackingId, use order ID as fallback
            if (!seenTrackingIds.has(order.id)) {
              seenTrackingIds.add(order.id);
              uniqueOrders.push(order);
            }
          }
        });
        
        setOrders(uniqueOrders);
        setLastUpdated(new Date());
        console.log(`Fetched ${uniqueOrders.length} unique orders for customer with details`);
        
        if (isRefresh) {
          toast.success(`Orders refreshed! Found ${uniqueOrders.length} order${uniqueOrders.length === 1 ? '' : 's'}`);
        } else if (uniqueOrders.length === 0) {
          toast.info('No orders found. Start shopping to see your orders here!');
        } else {
          toast.success(`Successfully loaded ${uniqueOrders.length} order${uniqueOrders.length === 1 ? '' : 's'}`);
        }
      } else {
        console.error('Failed to fetch orders:', result.error);
        toast.error('Failed to load your orders. Please try again.');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast.error('An error occurred while loading your orders.');
      setOrders([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Real-time listener for order updates
  useEffect(() => {
    if (!currentUser || isShop) return;

    const unsubscribe = listenToOrders(currentUser.uid, async (updatedOrders) => {
      // Load additional address and payment data for real-time updates
      const ordersWithDetails = await Promise.all(
        updatedOrders.map(async (order) => {
          try {
            if (order.addressId) {
              const addressResult = await getAddressById(order.addressId);
              if (addressResult.success) {
                order.shippingAddressData = addressResult.address;
              }
            }
            
            if (order.paymentId) {
              const paymentResult = await getPaymentById(order.paymentId);
              if (paymentResult.success) {
                order.paymentData = paymentResult.payment;
              }
            }
            
            return order;
          } catch (error) {
            console.warn('Failed to load additional data for real-time order update:', order.id, error);
            return order;
          }
        })
      );
      
      // Deduplicate orders by trackingId to prevent duplicates
      const uniqueOrders = [];
      const seenTrackingIds = new Set();
      
      ordersWithDetails.forEach(order => {
        if (order.trackingId && !seenTrackingIds.has(order.trackingId)) {
          seenTrackingIds.add(order.trackingId);
          uniqueOrders.push(order);
        } else if (!order.trackingId) {
          // If no trackingId, use order ID as fallback
          if (!seenTrackingIds.has(order.id)) {
            seenTrackingIds.add(order.id);
            uniqueOrders.push(order);
          }
        }
      });
      
      setOrders(uniqueOrders);
      setLastUpdated(new Date());
      console.log('Orders updated in real-time with details:', uniqueOrders.length);
    });

    return () => unsubscribe();
  }, [currentUser, isShop]);

  // Initial data fetch
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please log in to view your orders');
      navigate('/login');
      return;
    }

    if (isShop) {
      toast.info('Redirecting to shop dashboard');
      navigate('/shop-owner-home');
      return;
    }

    fetchCustomerOrders();
  }, [currentUser, isShop, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'ready':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Ready for Pickup/Delivery';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'We have received your order and are reviewing it.';
      case 'confirmed':
        return 'Your order has been confirmed and is in our queue.';
      case 'preparing':
        return 'Our bakers are working on your delicious treats!';
      case 'ready':
        return 'Your order is ready! You can pick it up or we will deliver it soon.';
      case 'out_for_delivery':
        return 'Your order is on its way to you!';
      case 'delivered':
        return 'Your order has been delivered. Enjoy!';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper function to safely extract order data from Firebase
  const getOrderDisplayData = (order) => {
    try {
      // Handle both embedded and separate collection data
      let deliveryAddress = 'Address not specified';
      
      if (order.deliveryAddress) {
        deliveryAddress = formatAddress(order.deliveryAddress);
      } else if (order.shippingAddress) {
        deliveryAddress = formatAddress(order.shippingAddress);
      } else if (order.addressId && order.shippingAddressData) {
        // If we have separate address data loaded
        deliveryAddress = formatAddress(order.shippingAddressData);
      }
      
      return {
        id: order.id || 'N/A',
        trackingId: order.trackingId || order.id || 'N/A',
         items: Array.isArray(order.items) ? order.items : (Array.isArray(order.orderItems) ? order.orderItems : []),
         itemsCount: order.itemsCount || (Array.isArray(order.items) ? order.items.length : (Array.isArray(order.orderItems) ? order.orderItems.length : 0)),
        total: Number(order.total || order.orderSummary?.total || 0),
        status: order.status || order.orderStatus || 'pending',
        createdAt: order.createdAt || order.orderDate || order.timestamp,
        deliveredAt: order.deliveredAt || order.deliveryDate,
        estimatedDelivery: order.estimatedDelivery || order.estimatedDeliveryDate,
        deliveryAddress: deliveryAddress
      };
    } catch (error) {
      console.error('Error processing order data:', error, order);
      return {
        id: 'Error',
        trackingId: 'Error',
        items: [],
        total: 0,
        status: 'error',
        createdAt: null,
        deliveredAt: null,
        estimatedDelivery: null,
        deliveryAddress: 'Error processing order data'
      };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Your Orders</h2>
          <p className="text-gray-600">Fetching your order history from the database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full mb-6">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Your Order History 🎂
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track all your delicious orders and see their current status. Every sweet treat tells a story!
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by tracking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => fetchCustomerOrders(true)}
                disabled={loading || refreshing}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all transform hover:scale-105 disabled:transform-none font-medium shadow-lg flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg"
              >
                Order More Cakes
              </button>
            </div>
          </div>
          
          {/* Data Source Information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
              <div>
                <span className="font-medium">Data source:</span> Firebase Firestore
                {lastUpdated && (
                  <span className="ml-4">
                    • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="mt-2 sm:mt-0">
                <span className="font-medium">Total orders:</span> {orders.length}
                {filteredOrders.length !== orders.length && (
                  <span className="ml-2 text-pink-600">
                    (Showing {filteredOrders.length} filtered)
                  </span>
                )}
              </div>
            </div>
            
            {/* Development Debug Info */}
            {process.env.NODE_ENV === 'development' && orders.length > 0 && (
              <details className="mt-3 text-xs text-gray-400">
                <summary className="cursor-pointer hover:text-gray-600">🔍 Debug: Raw Order Data Structure</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-left overflow-auto max-h-32">
                  <pre>{JSON.stringify(orders[0], null, 2)}</pre>
                </div>
              </details>
            )}
          </div>
        </div>

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
                  : orders.length === 0 
                    ? 'You haven\'t placed any orders yet. Start your sweet journey today!'
                    : 'No orders match your current filters.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && orders.length === 0 && (
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg text-lg"
                >
                  Browse Our Cakes
                </button>
              )}
              {(searchTerm || statusFilter !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                const orderData = getOrderDisplayData(order);
                return (
                <div key={order.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-pink-100 to-blue-100 rounded-xl">
                          {getStatusIcon(orderData.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Order #{orderData.trackingId}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(orderData.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(orderData.status)}`}>
                        {getStatusText(orderData.status)}
                      </span>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    {/* Status Description */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg border border-pink-100">
                      <p className="text-sm text-gray-700">{getStatusDescription(orderData.status)}</p>
                    </div>

                    {/* Order Items */}
                     <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-blue-500" />
                        Your Order Items
                      </h4>
                      <div className="space-y-3">
                         {orderData.items && orderData.items.length > 0 ? (
                          orderData.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-200">
                              <div className="text-2xl">{item?.image || '🍰'}</div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{item?.name || 'Unknown Item'}</p>
                                <p className="text-sm text-gray-500">Qty: {item?.quantity || 0}</p>
                              </div>
                              <div className="font-semibold text-pink-600">${Number(item?.price || 0).toFixed(2)}</div>
                            </div>
                          ))
                         ) : (
                           <div className="text-center py-4 text-gray-500">
                             <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                             <p>Items stored in a separate collection.</p>
                             <p>Total items: {orderData.itemsCount}</p>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-100 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total:</span>
                        <span className="text-2xl font-bold text-pink-600">${Number(orderData.total || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                        Delivery Information
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">{orderData.deliveryAddress || 'Address not available'}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Estimated Delivery:</strong> {formatDate(orderData.estimatedDelivery)}
                      </p>
                      {orderData.deliveredAt && (
                        <p className="text-sm text-green-600 mt-1">
                          <strong>Delivered:</strong> {formatDate(orderData.deliveredAt)}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => navigate(`/track-order?trackingId=${orderData.trackingId}`)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Order Details #{getOrderDisplayData(selectedOrder).trackingId}</h3>
                  <p className="text-sm text-gray-500">Placed on {formatDate(getOrderDisplayData(selectedOrder).createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(getOrderDisplayData(selectedOrder).status)}`}>
                    {getStatusText(getOrderDisplayData(selectedOrder).status)}
                  </span>
                  <button onClick={() => { setShowOrderModal(false); setSelectedOrder(null); }} className="text-gray-500 hover:bg-gray-100 rounded-full p-2">✕</button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {getOrderDisplayData(selectedOrder).items && getOrderDisplayData(selectedOrder).items.length > 0 ? (
                          getOrderDisplayData(selectedOrder).items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 bg-white p-3 rounded shadow-sm">
                              <div className="text-2xl">{item?.image || '🍰'}</div>
                              <div className="flex-1">
                                <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                                <div className="text-sm text-gray-500">Qty: {item?.quantity || 0}</div>
                              </div>
                              <div className="font-semibold text-pink-600">${Number(item?.price || 0).toFixed(2)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>Order items not available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Order Summary</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><strong>Total Amount:</strong> ${Number(getOrderDisplayData(selectedOrder).total || 0).toFixed(2)}</div>
                        <div><strong>Order Date:</strong> {formatDate(getOrderDisplayData(selectedOrder).createdAt)}</div>
                        <div><strong>Estimated Delivery:</strong> {formatDate(getOrderDisplayData(selectedOrder).estimatedDelivery)}</div>
                        {getOrderDisplayData(selectedOrder).deliveredAt && (
                          <div><strong>Delivered:</strong> {formatDate(getOrderDisplayData(selectedOrder).deliveredAt)}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Order Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(getOrderDisplayData(selectedOrder).status)}
                          <div>
                            <p className="font-medium text-gray-800">{getStatusText(getOrderDisplayData(selectedOrder).status)}</p>
                            <p className="text-sm text-gray-600">{getStatusDescription(getOrderDisplayData(selectedOrder).status)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Delivery Address</h4>
                      <div className="text-sm text-gray-700">
                        <p>{getOrderDisplayData(selectedOrder).deliveryAddress || 'Address not available'}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Payment Information</h4>
                      <div className="text-sm text-gray-700">
                        {selectedOrder.paymentData ? (
                          <div>
                            <p><strong>Card:</strong> **** **** **** {selectedOrder.paymentData?.cardNumber?.slice(-4) || '****'}</p>
                            <p><strong>Cardholder:</strong> {selectedOrder.paymentData?.cardholderName || 'N/A'}</p>
                            <p><strong>Amount:</strong> ${Number(selectedOrder.paymentData?.amount || 0).toFixed(2)}</p>
                            <p><strong>Status:</strong> <span className="capitalize">{selectedOrder.paymentData?.status || 'pending'}</span></p>
                          </div>
                        ) : (
                          <p className="text-gray-500">Payment information not available</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-lg border border-pink-100">
                      <h4 className="font-semibold mb-2 text-pink-800">Need Help?</h4>
                      <p className="text-sm text-pink-700 mb-3">
                        If you have any questions about your order, feel free to contact us.
                      </p>
                      <button className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrdersPage;
