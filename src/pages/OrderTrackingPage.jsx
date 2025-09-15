import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { getOrderByTrackingId, getOrderById, getDeliveryTracking, getOrdersByUser } from '../firebase/database';
import { toast } from 'react-toastify';

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [deliveryTracking, setDeliveryTracking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState('tracking'); // 'tracking' or 'email'

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    
    if (searchMethod === 'tracking') {
      if (!orderId.trim()) {
        toast.error('Please enter an order ID or tracking ID');
        return;
      }
    } else {
      if (!email.trim()) {
        toast.error('Please enter your email address');
        return;
      }
    }

    setIsLoading(true);
    setTrackingData(null);
    setDeliveryTracking(null);
    
    try {
      if (searchMethod === 'tracking') {
        console.log('Tracking order with ID:', orderId.trim());
        
        // Try to find order by tracking ID first
        const orderResult = await getOrderByTrackingId(orderId.trim());
        console.log('Tracking ID search result:', orderResult);
        
        if (orderResult.success) {
          setTrackingData(orderResult.order);
          
          // Get delivery tracking information
          try {
            const deliveryResult = await getDeliveryTracking(orderResult.order.id);
            console.log('Delivery tracking result:', deliveryResult);
            if (deliveryResult.success) {
              setDeliveryTracking(deliveryResult.tracking);
            }
          } catch (deliveryError) {
            console.warn('Failed to load delivery tracking:', deliveryError);
          }
          
          toast.success('Order found!');
        } else {
          // If not found by tracking ID, try by order ID
          console.log('Order not found by tracking ID, trying order ID...');
          const orderByIdResult = await getOrderById(orderId.trim());
          console.log('Order ID search result:', orderByIdResult);
          
          if (orderByIdResult.success) {
            setTrackingData(orderByIdResult.order);
            
            // Get delivery tracking information
            try {
              const deliveryResult = await getDeliveryTracking(orderByIdResult.order.id);
              if (deliveryResult.success) {
                setDeliveryTracking(deliveryResult.tracking);
              }
            } catch (deliveryError) {
              console.warn('Failed to load delivery tracking:', deliveryError);
            }
            
            toast.success('Order found!');
          } else {
            toast.error('Order not found. Please check your tracking ID or order ID.');
          }
        }
      } else {
        // Search by email
        console.log('Searching orders by email:', email.trim());
        const ordersResult = await getOrdersByUser(email.trim());
        console.log('Email search result:', ordersResult);
        
        if (ordersResult.success && ordersResult.orders.length > 0) {
          // Show the most recent order
          const mostRecentOrder = ordersResult.orders[0];
          setTrackingData(mostRecentOrder);
          
          // Get delivery tracking information
          try {
            const deliveryResult = await getDeliveryTracking(mostRecentOrder.id);
            if (deliveryResult.success) {
              setDeliveryTracking(deliveryResult.tracking);
            }
          } catch (deliveryError) {
            console.warn('Failed to load delivery tracking:', deliveryError);
          }
          
          toast.success(`Found ${ordersResult.orders.length} order(s)! Showing most recent.`);
        } else {
          toast.error('No orders found for this email address.');
        }
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error(`Error tracking order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'current':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-gray-400" />;
      default:
        return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your tracking ID or order ID to track the status of your delicious cakes and pastries. 
            We'll keep you updated every step of the way.
          </p>
        </div>

        {/* Search Method Toggle */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => {
                setSearchMethod('tracking');
                setOrderId('');
                setEmail('');
                setTrackingData(null);
                setDeliveryTracking(null);
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                searchMethod === 'tracking'
                  ? 'bg-cake-red text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Track by ID
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMethod('email');
                setOrderId('');
                setEmail('');
                setTrackingData(null);
                setDeliveryTracking(null);
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                searchMethod === 'email'
                  ? 'bg-cake-red text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Track by Email
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              {searchMethod === 'tracking' ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking ID or Order ID
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter your tracking ID (e.g., TRK-ABC123) or order ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  />
                </>
              )}
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Searching...' : 'Track Order'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Order ID</div>
                  <div className="font-semibold text-gray-800">{trackingData.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tracking ID</div>
                  <div className="font-semibold text-cake-red">{trackingData.trackingId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
                    {trackingData.status}
                  </span>
                </div>
              </div>
              
              {trackingData.estimatedDelivery && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-1">Estimated Delivery</div>
                  <div className="font-semibold text-gray-800">{formatDate(trackingData.estimatedDelivery)}</div>
                </div>
              )}
            </div>

            {/* Current Location */}
            {deliveryTracking && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  Current Location
                </h2>
                <div className="bg-cake-pink rounded-xl p-6">
                  <div className="font-semibold text-gray-800 text-lg mb-2">
                    {deliveryTracking.currentLocation}
                  </div>
                  <div className="text-gray-600">
                    {deliveryTracking.status === 'pending' && 'Your order is being processed and will be delivered soon.'}
                    {deliveryTracking.status === 'confirmed' && 'Your order has been confirmed and is being prepared.'}
                    {deliveryTracking.status === 'in_transit' && 'Your order is on its way to you.'}
                    {deliveryTracking.status === 'delivered' && 'Your order has been delivered successfully.'}
                  </div>
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Timeline
              </h2>
              <div className="space-y-6">
                {trackingData.timeline && trackingData.timeline.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{step.step}</h3>
                        <span className="text-sm text-gray-500">{formatDate(step.timestamp)}</span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                      {step.updatedBy && (
                        <span className="text-xs text-gray-400 mt-1">Updated by: {step.updatedBy}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Updates */}
            {deliveryTracking && deliveryTracking.deliveryUpdates && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Delivery Updates
                </h2>
                <div className="space-y-4">
                  {deliveryTracking.deliveryUpdates.map((update, index) => (
                    <div key={index} className="border-l-4 border-cake-red pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{update.status}</h3>
                        <span className="text-sm text-gray-500">{formatDate(update.timestamp)}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{update.description}</p>
                      {update.location && (
                        <p className="text-xs text-gray-400 mt-1">Location: {update.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            {trackingData.items && trackingData.items.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {trackingData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <Package className="w-8 h-8 text-cake-red" />
                        <div>
                          <div className="font-semibold text-gray-800">{item.name || item.productName || 'Product'}</div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity || 1} × ${(item.price || item.unitPrice || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-800">
                        ${((item.price || item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Order Date</div>
                  <div className="font-semibold text-gray-800">{formatDate(trackingData.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="font-semibold text-gray-800">${trackingData.total?.toFixed(2) || trackingData.orderSummary?.total?.toFixed(2) || '0.00'}</div>
                </div>
                {trackingData.shopNotes && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500 mb-1">Shop Notes</div>
                    <div className="font-semibold text-gray-800 bg-yellow-50 p-3 rounded-lg">
                      {trackingData.shopNotes}
                    </div>
                  </div>
                )}
                {trackingData.shippingAddress && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500 mb-1">Delivery Address</div>
                    <div className="font-semibold text-gray-800 bg-blue-50 p-3 rounded-lg">
                      {trackingData.shippingAddress.address || 
                       `${trackingData.shippingAddress.streetAddress || ''} ${trackingData.shippingAddress.city || ''} ${trackingData.shippingAddress.state || ''} ${trackingData.shippingAddress.zipCode || ''}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-cake-pink to-cake-cream rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Need Help?
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about your order or need assistance, 
                please don't hesitate to contact us.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-white rounded-xl p-4">
                  <div className="font-semibold text-gray-800 mb-1">Phone</div>
                  <div className="text-gray-600">+91 7208327881 </div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="font-semibold text-gray-800 mb-1">Email</div>
                  <div className="text-gray-600">princeprajapati8392@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Note */}
        {!trackingData && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="font-semibold text-blue-800 mb-2">How to Track Your Order</h3>
              <p className="text-blue-700 mb-4">
                Choose your preferred method to track your order and get real-time updates.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 text-left">
                  <h4 className="font-semibold text-gray-800 mb-2">Track by ID:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• TRK-ABC123XYZ</li>
                    <li>• TRK-DEF456UVW</li>
                    <li>• Your order ID from confirmation</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 text-left">
                  <h4 className="font-semibold text-gray-800 mb-2">Track by Email:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Enter your email address</li>
                    <li>• View your recent orders</li>
                    <li>• Track multiple orders</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
