import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getShopOrders, updateOrderStatus, confirmOrder, updateDeliveryTracking } from '../firebase/database';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const ShopDashboard = () => {
  const { currentUser, userData, isShop } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (!currentUser || !isShop) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [currentUser, isShop, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Use shop-1 as the shopId since all products are from shop-1
      const result = await getShopOrders('shop-1');
      if (result.success) {
        setOrders(result.orders);
      } else {
        toast.error('Error loading orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action, notes = '') => {
    try {
      let result;
      
      switch (action) {
        case 'confirm':
          result = await confirmOrder(orderId, {
            notes: notes,
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          });
          break;
        case 'preparing':
          result = await updateOrderStatus(orderId, 'preparing', notes);
          break;
        case 'ready':
          result = await updateOrderStatus(orderId, 'ready', notes);
          break;
        case 'in_transit':
          result = await updateOrderStatus(orderId, 'in_transit', notes);
          await updateDeliveryTracking(orderId, 'in_transit', 'On the way to customer');
          break;
        case 'delivered':
          result = await updateOrderStatus(orderId, 'delivered', notes);
          await updateDeliveryTracking(orderId, 'delivered', 'Delivered to customer');
          break;
        default:
          result = await updateOrderStatus(orderId, action, notes);
      }

      if (result.success) {
        toast.success(`Order ${action} successfully`);
        loadOrders(); // Reload data
        setShowOrderModal(false);
        setSelectedOrder(null);
      } else {
        toast.error(result.error || `Error updating order status`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error updating order status');
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    in_transit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-16">
            <div className="loading-spinner mb-6" />
            <p className="body-text text-gray-600">Loading shop dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero section-padding">
      <div className="max-width-container container-padding">
        {/* Header */}
        <div className="card p-8 shadow-strong mb-12 border-2 border-cake-pink/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="heading-2 text-gray-800">Shop Dashboard</h1>
                <p className="body-text text-gray-600">Manage your orders and track deliveries</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/add-product')}
              className="btn-primary px-8 py-4"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="responsive-grid-4 gap-8 mb-12">
          <div className="card p-8 shadow-medium hover:shadow-strong transition-all duration-300 border-2 border-cake-pink/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-text text-gray-600 mb-2">Total Orders</p>
                <p className="heading-1 text-gray-800">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-cake-red/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-cake-red" />
              </div>
            </div>
          </div>

          <div className="card p-8 shadow-medium hover:shadow-strong transition-all duration-300 border-2 border-cake-pink/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-text text-gray-600 mb-2">Pending</p>
                <p className="heading-1 text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="card p-8 shadow-medium hover:shadow-strong transition-all duration-300 border-2 border-cake-pink/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-text text-gray-600 mb-2">In Progress</p>
                <p className="heading-1 text-blue-600">{stats.confirmed + stats.preparing}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="card p-8 shadow-medium hover:shadow-strong transition-all duration-300 border-2 border-cake-pink/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="body-text text-gray-600 mb-2">Total Revenue</p>
                <p className="heading-1 text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-8 shadow-medium border-2 border-cake-pink/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-3 text-gray-800">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-cake-red hover:text-red-700 font-medium hover:bg-cake-pink/50 px-4 py-2 rounded-xl transition-all duration-300"
            >
              View All Orders
            </button>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <p className="body-text text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="card card-hover p-6 border-2 border-cake-pink/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <p className="heading-4 text-gray-800">Order #{order.trackingId || order.id}</p>
                        <span className={`badge badge-primary shadow-soft flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div className="responsive-grid-3 gap-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">Customer:</span>
                          <span>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">Total:</span>
                          <span className="text-cake-red font-bold">${order.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">Date:</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => openOrderModal(order)}
                        className="btn-primary flex items-center space-x-3 px-6 py-3"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Manage</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Management Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-strong">
            <div className="flex items-center justify-between mb-8 p-8 pb-0">
              <h2 className="heading-2 text-gray-800">Order Management</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-300"
              >
                ✕
              </button>
            </div>

            <div className="responsive-grid-2 gap-8 p-8 pt-0">
              {/* Order Information */}
              <div className="space-y-8">
                <div className="card p-6 bg-gray-50/50">
                  <h3 className="heading-4 text-gray-800 mb-6">Order Information</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Order ID:</span>
                      <span className="font-semibold">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Tracking ID:</span>
                      <span className="font-semibold">{selectedOrder.trackingId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Status:</span>
                      <span className={`badge badge-primary ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Total:</span>
                      <span className="font-semibold text-cake-red">${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Order Date:</span>
                      <span className="font-semibold">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                {selectedOrder.customerInfo && (
                  <div className="card p-6 bg-gray-50/50">
                    <h3 className="heading-4 text-gray-800 mb-6">Customer Information</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 font-medium">Name:</span>
                        <span className="font-semibold">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 font-medium">Email:</span>
                        <span className="font-semibold">{selectedOrder.customerInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 font-medium">Phone:</span>
                        <span className="font-semibold">{selectedOrder.customerInfo.phone}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-gray-500 font-medium">Address:</span>
                        <span className="font-semibold">{selectedOrder.customerInfo.address}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="card p-6 bg-gray-50/50">
                  <h3 className="heading-4 text-gray-800 mb-6">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm p-3 bg-white rounded-lg shadow-soft">
                        <div>
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-gray-500 ml-3">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold text-cake-red">${item.price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="space-y-8">
                <div className="card p-6 bg-gray-50/50">
                  <h3 className="heading-4 text-gray-800 mb-6">Update Order Status</h3>
                  <div className="space-y-4">
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => handleOrderAction(selectedOrder.id, 'confirm')}
                        className="w-full btn-primary bg-blue-500 hover:bg-blue-600"
                      >
                        Confirm Order
                      </button>
                    )}
                    {['confirmed', 'pending'].includes(selectedOrder.status) && (
                      <button
                        onClick={() => handleOrderAction(selectedOrder.id, 'preparing')}
                        className="w-full btn-primary bg-purple-500 hover:bg-purple-600"
                      >
                        Start Preparing
                      </button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <button
                        onClick={() => handleOrderAction(selectedOrder.id, 'ready')}
                        className="w-full btn-primary bg-green-500 hover:bg-green-600"
                      >
                        Mark Ready
                      </button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <button
                        onClick={() => handleOrderAction(selectedOrder.id, 'in_transit')}
                        className="w-full btn-primary bg-orange-500 hover:bg-orange-600"
                      >
                        Start Delivery
                      </button>
                    )}
                    {selectedOrder.status === 'in_transit' && (
                      <button
                        onClick={() => handleOrderAction(selectedOrder.id, 'delivered')}
                        className="w-full btn-primary bg-green-500 hover:bg-green-600"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Timeline */}
                {selectedOrder.timeline && (
                  <div className="card p-6 bg-gray-50/50">
                    <h3 className="heading-4 text-gray-800 mb-6">Order Timeline</h3>
                    <div className="space-y-4">
                      {selectedOrder.timeline.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4 text-sm p-3 bg-white rounded-lg shadow-soft">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{step.step}</div>
                            <div className="text-gray-500 text-xs">{formatDate(step.timestamp)}</div>
                            <div className="text-gray-600">{step.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDashboard;
