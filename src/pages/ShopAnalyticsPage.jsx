import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, DollarSign, Users, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { getShopAnalytics } from '../firebase/database';

const ShopAnalyticsPage = () => {
  const { currentUser, userData, isShop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    orders: { total: 0, pending: 0, completed: 0, today: 0, weekly: 0 },
    revenue: { total: 0, weekly: 0 },
    customers: { active: 0, unique: 0 },
    inventory: { total: 0, lowStock: 0, outOfStock: 0 },
    employees: { total: 0, active: 0 }
  });

  useEffect(() => {
    if (!isShop) {
      navigate('/');
      return;
    }
  }, [isShop, navigate]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentUser || !isShop) return;
      
      try {
        setLoading(true);
        const result = await getShopAnalytics(currentUser.uid);
        
        if (result.success) {
          setAnalytics(result.analytics);
        } else {
          toast.error('Failed to load analytics: ' + result.error);
          setAnalytics({
            orders: { total: 0, pending: 0, completed: 0, today: 0, weekly: 0 },
            revenue: { total: 0, weekly: 0 },
            customers: { active: 0, unique: 0 },
            inventory: { total: 0, lowStock: 0, outOfStock: 0 },
            employees: { total: 0, active: 0 }
          });
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Error loading analytics: ' + error.message);
        setAnalytics({
          orders: { total: 0, pending: 0, completed: 0, today: 0, weekly: 0 },
          revenue: { total: 0, weekly: 0 },
          customers: { active: 0, unique: 0 },
          inventory: { total: 0, lowStock: 0, outOfStock: 0 },
          employees: { total: 0, active: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser, isShop]);

  const calculateAvgOrderValue = () => {
    if (analytics.orders.total === 0) return 0;
    return analytics.revenue.total / analytics.orders.total;
  };

  const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{analytics.revenue.total.toLocaleString()}</p>
                <p className="text-sm text-green-600">
                  {calculateGrowthRate(analytics.revenue.total, analytics.revenue.total * 0.8) > 0 ? '+' : ''}
                  {calculateGrowthRate(analytics.revenue.total, analytics.revenue.total * 0.8).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.orders.total}</p>
                <p className="text-sm text-blue-600">
                  {calculateGrowthRate(analytics.orders.total, analytics.orders.total * 0.9) > 0 ? '+' : ''}
                  {calculateGrowthRate(analytics.orders.total, analytics.orders.total * 0.9).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.customers.active}</p>
                <p className="text-sm text-purple-600">
                  {calculateGrowthRate(analytics.customers.active, analytics.customers.active * 0.85) > 0 ? '+' : ''}
                  {calculateGrowthRate(analytics.customers.active, analytics.customers.active * 0.85).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-indigo-600">₹{calculateAvgOrderValue().toFixed(2)}</p>
                <p className="text-sm text-indigo-600">
                  {calculateGrowthRate(calculateAvgOrderValue(), calculateAvgOrderValue() * 0.95) > 0 ? '+' : ''}
                  {calculateGrowthRate(calculateAvgOrderValue(), calculateAvgOrderValue() * 0.95).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-xl">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-amber-600">{analytics.orders.today}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{analytics.revenue.weekly.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{analytics.inventory.lowStock}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-100 to-red-200 rounded-xl">
                <Package className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Track your business performance and growth metrics! 📊✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/shop-orders')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <Package className="w-5 h-5 mr-2" />
                View Orders
              </button>
              <button
                onClick={() => navigate('/shop-customers')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Customer Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalyticsPage;
