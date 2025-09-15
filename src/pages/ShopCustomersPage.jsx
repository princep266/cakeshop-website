import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Search, Mail, Phone, Calendar, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { getShopOrders } from '../firebase/database';

const ShopCustomersPage = () => {
  const { currentUser, userData, isShop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isShop) {
      navigate('/');
      return;
    }
  }, [isShop, navigate]);

  useEffect(() => {
    const loadCustomers = async () => {
      if (!currentUser || !isShop) return;
      
      try {
        setLoading(true);
        const result = await getShopOrders(currentUser.uid);
        
        if (result.success) {
          // Derive customer data from orders
          const customerMap = new Map();
          
          result.orders.forEach(order => {
            const customerId = order.userId || order.userEmail;
            if (customerId) {
              if (!customerMap.has(customerId)) {
                customerMap.set(customerId, {
                  id: customerId,
                  name: order.customerName || order.userEmail?.split('@')[0] || 'Customer',
                  email: order.userEmail || '',
                  phone: order.customerPhone || '',
                  totalOrders: 0,
                  totalSpent: 0,
                  lastOrder: null,
                  joinDate: order.createdAt || order.orderDate,
                  rating: 4.5 + Math.random() * 0.5 // Simulated rating
                });
              }
              
              const customer = customerMap.get(customerId);
              customer.totalOrders += 1;
              customer.totalSpent += parseFloat(order.orderSummary?.total || order.total || 0);
              
              const orderDate = new Date(order.createdAt || order.orderDate);
              if (!customer.lastOrder || orderDate > new Date(customer.lastOrder)) {
                customer.lastOrder = order.createdAt || order.orderDate;
              }
              
              if (!customer.joinDate || orderDate < new Date(customer.joinDate)) {
                customer.joinDate = order.createdAt || order.orderDate;
              }
            }
          });
          
          const customersArray = Array.from(customerMap.values());
          customersArray.sort((a, b) => b.totalSpent - a.totalSpent); // Sort by total spent
          
          setCustomers(customersArray);
        } else {
          toast.error('Failed to load customers: ' + result.error);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Error loading customers: ' + error.message);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [currentUser, isShop]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.totalOrders > 0).length;
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    
    return { totalCustomers, activeCustomers, totalOrders, totalRevenue };
  };

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/shop-owner-home')}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeCustomers}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-3 text-purple-600" />
            Customers ({filteredCustomers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">{customer.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email || 'No email'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone || 'No phone'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {formatDate(customer.joinDate)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="font-bold text-blue-600">{customer.totalOrders}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Last Order</p>
                  <p className="font-semibold text-purple-600">{formatDate(customer.lastOrder)}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No customers have placed orders yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopCustomersPage;
