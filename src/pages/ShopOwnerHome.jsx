import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Package, Users, TrendingUp, Calendar, Clock, CheckCircle, 
  Truck, AlertCircle, Settings, BarChart3, FileText, ShoppingCart,
  Plus, Eye, Edit, Trash2, Filter, Search, RefreshCw, Bell,
  Star, Award, DollarSign, MapPin, Phone, Mail, Home, User, ArrowRight, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getShopOrders, 
  getShopProducts, 
  listenToOrders, 
  updateOrderStatus,
  confirmOrderWithDeliveryTime,
  getShopEmployees,
  addShopEmployee,
  updateShopEmployee,
  deleteShopEmployee,
  getShopInventory,
  addShopInventoryItem,
  updateShopInventoryItem,
  deleteShopInventoryItem,
  getShopAnalytics
} from '../firebase/database';


const ShopOwnerHome = () => {
  const { currentUser, userData, isShop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    todayOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  
  // Employee management state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    isActive: true,
    hourlyRate: '',
    startDate: '',
    department: ''
  });

  // Inventory management state
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: 0,
    unitPrice: 0,
    sku: '',
    category: '',
    supplier: '',
    minQuantity: 5,
    status: 'in_stock'
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, employees, inventory
  

  
  // Order confirmation state
  const [showOrderConfirmationModal, setShowOrderConfirmationModal] = useState(false);
  const [selectedOrderForConfirmation, setSelectedOrderForConfirmation] = useState(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [shopNotes, setShopNotes] = useState('');

  // Filter orders based on search term and status filter
  const filteredOrders = recentOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Redirect non-shop owners
  useEffect(() => {
    if (!isShop) {
      navigate('/');
      return;
    }
  }, [isShop, navigate]);

  // Load employees data
  const loadEmployees = async () => {
    if (!currentUser || !isShop) {
      console.log('loadEmployees: currentUser or isShop not available', { currentUser: !!currentUser, isShop });
      return;
    }
    
    try {
      setLoadingEmployees(true);
      const shopId = currentUser.uid;
      console.log('loadEmployees: Loading employees for shop:', shopId);
      
      const result = await getShopEmployees(shopId);
      console.log('loadEmployees: Result:', result);
      
      if (result.success) {
        setEmployees(result.employees || []);
        console.log('loadEmployees: Set employees:', result.employees?.length || 0);
      } else {
        console.error('Failed to load employees:', result.error);
        toast.error('Failed to load employees: ' + result.error);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error loading employees: ' + error.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Load inventory data
  const loadInventory = async () => {
    if (!currentUser || !isShop) {
      console.log('loadInventory: currentUser or isShop not available', { currentUser: !!currentUser, isShop });
      return;
    }
    
    try {
      setLoadingInventory(true);
      const shopId = currentUser.uid;
      console.log('loadInventory: Loading inventory for shop:', shopId);
      
      const result = await getShopInventory(shopId);
      console.log('loadInventory: Result:', result);
      
      if (result.success) {
        setInventory(result.inventory || []);
        console.log('loadInventory: Set inventory:', result.inventory?.length || 0);
      } else {
        console.error('Failed to load inventory:', result.error);
        toast.error('Failed to load inventory: ' + result.error);
        setInventory([]);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Error loading inventory: ' + error.message);
      setInventory([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Load shop analytics
  const loadShopAnalytics = async () => {
    if (!currentUser || !isShop) return;
    
    try {
      const shopId = currentUser.uid;
      const result = await getShopAnalytics(shopId);
      
      if (result.success) {
        const analytics = result.analytics;
        setStats({
          totalOrders: analytics.orders.total,
          pendingOrders: analytics.orders.pending,
          completedOrders: analytics.orders.completed,
          totalRevenue: analytics.revenue.total,
          activeCustomers: analytics.customers.active,
          todayOrders: analytics.orders.today
        });
      } else {
        console.error('Failed to load analytics:', result.error);
        // Fallback to basic stats
        await loadBasicStats();
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to basic stats
      await loadBasicStats();
    }
  };

  // Load basic stats (fallback)
  const loadBasicStats = async () => {
    if (!currentUser || !isShop) return;
    
    try {
      const shopId = currentUser.uid;
      const ordersResult = await getShopOrders(shopId);
      
      if (ordersResult.success) {
        const allOrders = ordersResult.orders || [];
        
        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(order => 
          ['pending', 'confirmed', 'preparing'].includes(order.status?.toLowerCase())
        ).length;
        const completedOrders = allOrders.filter(order => 
          ['ready', 'delivered'].includes(order.status?.toLowerCase())
        ).length;
        
        const totalRevenue = allOrders.reduce((sum, order) => {
          const orderTotal = order.orderSummary?.total || order.total || 0;
          return sum + (typeof orderTotal === 'number' ? orderTotal : parseFloat(orderTotal) || 0);
        }, 0);
        
        const uniqueCustomers = new Set(allOrders.map(order => order.userId));
        const activeCustomers = uniqueCustomers.size;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = allOrders.filter(order => {
          const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
          return orderDate >= today;
        }).length;
        
        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          activeCustomers,
          todayOrders
        });

        // Set recent orders (last 5 orders)
        const recentOrdersData = allOrders.slice(0, 5).map(order => ({
          id: order.id,
          customerName: order.userEmail || 'Customer',
          items: order.items?.map(item => item.name || item.productName || 'Product') || ['Product'],
          total: order.orderSummary?.total || order.total || 0,
          status: order.status || order.orderStatus || 'pending',
          createdAt: order.createdAt || order.orderDate,
          trackingId: order.trackingId || order.id
        }));
        
        setRecentOrders(recentOrdersData);
      }
    } catch (error) {
      console.error('Error loading basic stats:', error);
    }
  };

  useEffect(() => {
    console.log('ShopOwnerHome useEffect triggered:', { currentUser: !!currentUser, isShop, currentUserId: currentUser?.uid });
    
    const initializeShopDashboard = async () => {
      if (!currentUser || !isShop) {
        console.log('initializeShopDashboard: Skipping initialization - currentUser or isShop not available');
        return;
      }

      try {
        setLoading(true);
        console.log('initializeShopDashboard: Starting initialization for shop:', currentUser.uid);
        
        // Load all data in parallel
        await Promise.all([
          loadShopAnalytics(),
          loadEmployees(),
          loadInventory()
        ]);

        console.log('initializeShopDashboard: All data loaded successfully');

      } catch (error) {
        console.error('Error initializing shop dashboard:', error);
        toast.error('Failed to load shop dashboard: ' + error.message);
        
        // Fallback to empty stats
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          activeCustomers: 0,
          todayOrders: 0
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    initializeShopDashboard();
  }, [currentUser, isShop]);

  // Real-time listener for orders
  useEffect(() => {
    if (!currentUser || !isShop) return;

    const shopId = currentUser.uid;
    
    // Set up real-time listener for shop orders
    const unsubscribe = listenToOrders(shopId, async (orders) => {
      // Filter orders for this shop
      const shopOrders = orders.filter(order => order.shopId === shopId);
      
      if (shopOrders.length > 0) {
        // Check for new orders (orders created in the last minute)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const newOrders = shopOrders.filter(order => {
          const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
          return orderDate > oneMinuteAgo;
        });
        
        if (newOrders.length > 0) {
          setNewOrderNotification(true);
          toast.info(`🆕 ${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} received!`);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => setNewOrderNotification(false), 5000);
        }
        
        // Update recent orders
        const recentOrdersData = shopOrders.slice(0, 5).map(order => ({
          id: order.id,
          customerName: order.userEmail || 'Customer',
          items: order.items?.map(item => item.name || item.productName || 'Product') || ['Product'],
          total: order.orderSummary?.total || order.total || 0,
          status: order.status || order.orderStatus || 'pending',
          createdAt: order.createdAt || order.orderDate,
          trackingId: order.trackingId || order.id,
          estimatedDelivery: order.estimatedDelivery || null
        }));
        
        setRecentOrders(recentOrdersData);
        
        // Update stats
        const totalOrders = shopOrders.length;
        const pendingOrders = shopOrders.filter(order => 
          ['pending', 'confirmed', 'preparing'].includes(order.status?.toLowerCase())
        ).length;
        const completedOrders = shopOrders.filter(order => 
          ['ready', 'delivered'].includes(order.status?.toLowerCase())
        ).length;
        
        const totalRevenue = shopOrders.reduce((sum, order) => {
          const orderTotal = order.orderSummary?.total || order.total || 0;
          return sum + (typeof orderTotal === 'number' ? orderTotal : parseFloat(orderTotal) || 0);
        }, 0);
        
        const uniqueCustomers = new Set(shopOrders.map(order => order.userId));
        const activeCustomers = uniqueCustomers.size;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = shopOrders.filter(order => {
          const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
          return orderDate >= today;
        }).length;
        
        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          activeCustomers,
          todayOrders
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, isShop]);

  // Refresh data when tab changes
  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployees();
    } else if (activeTab === 'inventory') {
      loadInventory();
    }
  }, [activeTab, currentUser, isShop]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <Award className="w-5 h-5 text-green-600" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
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
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/shop-order-details/${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    navigate(`/shop-edit-order/${orderId}`);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      // Remove from local state
      setRecentOrders(prev => prev.filter(order => order.id !== orderId));
      setStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders - 1
      }));
      toast.success('Order removed from dashboard');
      // Note: In a real app, you would also delete from Firebase
    }
  };

  // Handle order confirmation with estimated delivery time
  const handleOrderConfirmation = async (order) => {
    setSelectedOrderForConfirmation(order);
    setEstimatedDeliveryTime('');
    setShopNotes('');
    setShowOrderConfirmationModal(true);
  };

  const confirmOrder = async () => {
    if (!selectedOrderForConfirmation || !estimatedDeliveryTime) {
      toast.error('Please provide estimated delivery time');
      return;
    }

    try {
      setLoading(true);
      
      const result = await confirmOrderWithDeliveryTime(
        selectedOrderForConfirmation.id,
        estimatedDeliveryTime,
        shopNotes
      );

      if (result.success) {
        toast.success(`Order confirmed successfully! Estimated delivery: ${estimatedDeliveryTime}`);
        
        // Update local state
        setRecentOrders(prev => prev.map(order => 
          order.id === selectedOrderForConfirmation.id 
            ? { 
                ...order, 
                status: 'confirmed',
                estimatedDelivery: estimatedDeliveryTime
              }
            : order
        ));

        // Update stats
        setStats(prev => ({
          ...prev,
          pendingOrders: Math.max(0, prev.pendingOrders - 1)
        }));

        setShowOrderConfirmationModal(false);
        setSelectedOrderForConfirmation(null);
        setEstimatedDeliveryTime('');
        setShopNotes('');
      } else {
        throw new Error(result.error || 'Failed to confirm order');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus, currentUser: currentUser?.uid });
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }
      
      setUpdatingOrder(orderId);
      
      // Update local state immediately for better UX
      setRecentOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Update stats
      setStats(prev => {
        const oldOrder = recentOrders.find(o => o.id === orderId);
        if (!oldOrder) return prev;
        
        const oldStatus = oldOrder.status;
        const newStatusLower = newStatus.toLowerCase();
        const oldStatusLower = oldStatus.toLowerCase();
        
        let pendingOrders = prev.pendingOrders;
        let completedOrders = prev.completedOrders;
        
        // Adjust pending orders count
        if (['pending', 'confirmed', 'preparing'].includes(oldStatusLower) && 
            !['pending', 'confirmed', 'preparing'].includes(newStatusLower)) {
          pendingOrders = Math.max(0, pendingOrders - 1);
        } else if (!['pending', 'confirmed', 'preparing'].includes(oldStatusLower) && 
                   ['pending', 'confirmed', 'preparing'].includes(newStatusLower)) {
          pendingOrders += 1;
        }
        
        // Adjust completed orders count
        if (['ready', 'delivered'].includes(oldStatusLower) && 
            !['ready', 'delivered'].includes(newStatusLower)) {
          completedOrders = Math.max(0, completedOrders - 1);
        } else if (!['ready', 'delivered'].includes(oldStatusLower) && 
                   ['ready', 'delivered'].includes(newStatusLower)) {
          completedOrders += 1;
        }
        
        return { ...prev, pendingOrders, completedOrders };
      });
      
      // Update Firebase
      console.log('Calling updateOrderStatus with:', { orderId, newStatus });
      const updateResult = await updateOrderStatus(orderId, newStatus, ''); // Pass empty string instead of undefined
      console.log('Update result:', updateResult);
      
      if (updateResult.success) {
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        throw new Error(updateResult.error || 'Failed to update order status');
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
      
      // Revert local state on error
      setRecentOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: recentOrders.find(o => o.id === orderId)?.status || 'pending' }
          : order
      ));
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Employee management functions
  const openAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      name: '',
      role: '',
      phone: '',
      email: '',
      isActive: true,
      hourlyRate: '',
      startDate: '',
      department: ''
    });
    setShowEmployeeModal(true);
  };

  const openEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      name: emp.name || '',
      role: emp.role || '',
      phone: emp.phone || '',
      email: emp.email || '',
      isActive: emp.isActive !== false,
      hourlyRate: emp.hourlyRate || '',
      startDate: emp.startDate || '',
      department: emp.department || ''
    });
    setShowEmployeeModal(true);
  };

  const saveEmployee = async () => {
    try {
      if (!employeeForm.name || !employeeForm.role) {
        toast.error('Name and role are required');
        return;
      }

      const shopId = currentUser.uid;
      
      if (editingEmployee) {
        const result = await updateShopEmployee(editingEmployee.id, employeeForm);
        if (result.success) {
          toast.success('Employee updated successfully');
          await loadEmployees();
          setShowEmployeeModal(false);
        } else {
          toast.error(result.error || 'Error updating employee');
        }
      } else {
        const result = await addShopEmployee(shopId, employeeForm);
        if (result.success) {
          toast.success('Employee added successfully');
          await loadEmployees();
          setShowEmployeeModal(false);
        } else {
          toast.error(result.error || 'Error adding employee');
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Error saving employee');
    }
  };

  const deleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const result = await deleteShopEmployee(employeeId);
        if (result.success) {
          toast.success('Employee deleted successfully');
          await loadEmployees();
        } else {
          toast.error(result.error || 'Error deleting employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Error deleting employee');
      }
    }
  };

  // Inventory management functions
  const openAddInventory = () => {
    setEditingInventory(null);
    setInventoryForm({
      name: '',
      quantity: 0,
      unitPrice: 0,
      sku: '',
      category: '',
      supplier: '',
      minQuantity: 5,
      status: 'in_stock'
    });
    setShowInventoryModal(true);
  };

  const openEditInventory = (item) => {
    setEditingInventory(item);
    setInventoryForm({
      name: item.name || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      sku: item.sku || '',
      category: item.category || '',
      supplier: item.supplier || '',
      minQuantity: item.minQuantity || 5,
      status: item.status || 'in_stock'
    });
    setShowInventoryModal(true);
  };

  const saveInventory = async () => {
    try {
      if (!inventoryForm.name || inventoryForm.quantity < 0) {
        toast.error('Name and quantity are required');
        return;
      }

      const shopId = currentUser.uid;
      
      if (editingInventory) {
        const result = await updateShopInventoryItem(editingInventory.id, inventoryForm);
        if (result.success) {
          toast.success('Inventory item updated successfully');
          await loadInventory();
          setShowInventoryModal(false);
        } else {
          toast.error(result.error || 'Error updating inventory item');
        }
      } else {
        const result = await addShopInventoryItem(shopId, inventoryForm);
        if (result.success) {
          toast.success('Inventory item added successfully');
          await loadInventory();
          setShowInventoryModal(false);
        } else {
          toast.error(result.error || 'Error adding inventory item');
        }
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error('Error saving inventory item');
    }
  };

  const deleteInventory = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        const result = await deleteShopInventoryItem(itemId);
        if (result.success) {
          toast.success('Inventory item deleted successfully');
          await loadInventory();
        } else {
          toast.error(result.error || 'Error deleting inventory item');
        }
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        toast.error('Error deleting inventory item');
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Store className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Your Shop Dashboard</h2>
          <p className="text-gray-600 mb-6">Preparing your bakery management tools...</p>
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mb-6">
            <Store className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Shop Owner Dashboard
          </h1>
            {newOrderNotification && (
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
            )}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Welcome back, <span className="font-semibold text-blue-600">{userData?.firstName || 'Shop Owner'}</span>! 
            Manage your bakery operations, track orders, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
              <Store className="w-4 h-4 mr-2" />
              Professional Shop Owner
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Orders
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'employees'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employees
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Inventory
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <button
            onClick={() => navigate('/shop-orders')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-600">Manage Orders</p>
                <p className="text-lg font-bold text-gray-900">View All Orders</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
              <span className="text-sm font-medium">Go to Orders</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/add-product')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl">
                <Plus className="w-7 h-7 text-orange-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-600">Add Product</p>
                <p className="text-lg font-bold text-gray-900">Create New Item</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-orange-600 group-hover:text-orange-700">
              <span className="text-sm font-medium">Add Product</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/shop-analytics')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <BarChart3 className="w-7 h-7 text-green-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-600">Analytics</p>
                <p className="text-lg font-bold text-gray-900">View Reports</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 group-hover:text-green-700">
              <span className="text-sm font-medium">View Analytics</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/shop-customers')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-lg font-bold text-gray-900">Manage Customers</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-purple-600 group-hover:text-purple-700">
              <span className="text-sm font-medium">View Customers</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/shop-settings')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                <Settings className="w-7 h-7 text-gray-600" />
              </div>
              <div className="ml-4 text-left">
                <p className="text-sm font-medium text-gray-600">Settings</p>
                <p className="text-lg font-bold text-gray-900">Configure Shop</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-gray-600 group-hover:text-gray-700">
              <span className="text-sm font-medium">Go to Settings</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingOrders}</p>
                <p className="text-sm text-amber-600">Requires attention</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+8% from last month</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-purple-600">{stats.activeCustomers}</p>
                <p className="text-sm text-purple-600">+5 new this week</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.todayOrders}</p>
                <p className="text-sm text-indigo-600">Keep up the good work!</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-xl">
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-3xl font-bold text-purple-600">{employees.filter(emp => emp.isActive).length}</p>
                <p className="text-sm text-purple-600">Team members</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                <p className="text-3xl font-bold text-indigo-600">{inventory.length}</p>
                <p className="text-sm text-indigo-600">Total items</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-xl">
                <Store className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-amber-600">{inventory.filter(item => (item.quantity || 0) <= (item.minQuantity || 5)).length}</p>
                <p className="text-sm text-amber-600">Needs attention</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </p>
                <p className="text-sm text-green-600">Orders completed</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-blue-600">Per order</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>



        {/* Recent Orders Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="w-6 h-6 mr-3 text-blue-600" />
              Recent Orders
            </h2>
              <p className="text-sm text-gray-500 mt-1">
                {recentOrders.length > 0 ? 
                  `Showing ${filteredOrders.length} of ${stats.totalOrders} total orders` : 
                  'No orders found'
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Data source: Firebase Firestore • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => navigate('/shop-orders')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl transition-all transform hover:scale-105 font-medium"
            >
              View All Orders
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => {
                setLoading(true);
                // Re-fetch data
                const initializeShopDashboard = async () => {
                  try {
                    const shopId = currentUser.uid;
                    const ordersResult = await getShopOrders(shopId);
                    if (ordersResult.success) {
                      const allOrders = ordersResult.orders || [];
                      
                      // Recalculate stats
                      const totalOrders = allOrders.length;
                      const pendingOrders = allOrders.filter(order => 
                        ['pending', 'confirmed', 'preparing'].includes(order.status?.toLowerCase())
                      ).length;
                      const completedOrders = allOrders.filter(order => 
                        ['ready', 'delivered'].includes(order.status?.toLowerCase())
                      ).length;
                      
                      const totalRevenue = allOrders.reduce((sum, order) => {
                        const orderTotal = order.orderSummary?.total || order.total || 0;
                        return sum + (typeof orderTotal === 'number' ? orderTotal : parseFloat(orderTotal) || 0);
                      }, 0);
                      
                      const uniqueCustomers = new Set(allOrders.map(order => order.userId));
                      const activeCustomers = uniqueCustomers.size;
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const todayOrders = allOrders.filter(order => {
                        const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
                        return orderDate >= today;
                      }).length;
                      
                      setStats({
                        totalOrders,
                        pendingOrders,
                        completedOrders,
                        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                        activeCustomers,
                        todayOrders
                      });
                      
                      const recentOrdersData = allOrders.slice(0, 5).map(order => ({
                        id: order.id,
                        customerName: order.userEmail || 'Customer',
                        items: order.items?.map(item => item.name || item.productName || 'Product') || ['Product'],
                        total: order.orderSummary?.total || order.total || 0,
                        status: order.status || order.orderStatus || 'pending',
                        createdAt: order.createdAt || order.orderDate,
                        trackingId: order.trackingId || order.id,
                        estimatedDelivery: order.estimatedDelivery || null
                      }));
                      
                      setRecentOrders(recentOrdersData);
                      toast.success('Dashboard refreshed successfully!');
                    }
                  } catch (error) {
                    console.error('Error refreshing dashboard:', error);
                    toast.error('Failed to refresh dashboard');
                  } finally {
                    setLoading(false);
                  }
                };
                initializeShopDashboard();
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-medium flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            {filteredOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Est. Delivery</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium text-gray-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 truncate">
                          {order.items.join(', ')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-600">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          disabled={updatingOrder === order.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(order.status)} ${updatingOrder === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingOrder === order.id && (
                          <div className="ml-2">
                            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                          </div>
                        )}
                    </td>
                    <td className="py-4 px-4">
                      {order.estimatedDelivery ? (
                        <span className="text-sm text-green-600 font-medium">
                          {order.estimatedDelivery}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {/* Confirm Order Button - Only show for pending orders */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleOrderConfirmation(order)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Confirm Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditOrder(order.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit Order"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Your shop hasn\'t received any orders yet. Orders will appear here once customers start placing them.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Weekly Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <span className="text-gray-700">Orders Completed</span>
                <span className="font-bold text-green-600">{stats.completedOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <span className="text-gray-700">Revenue Generated</span>
                <span className="font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <span className="text-gray-700">Active Customers</span>
                <span className="font-bold text-purple-600">{stats.activeCustomers}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-amber-600" />
              Upcoming Tasks
            </h3>
            <div className="space-y-3">
              {stats.pendingOrders > 0 && (
                <div className="flex items-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <Clock className="w-4 h-4 mr-3 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">{stats.pendingOrders} Pending Orders</p>
                    <p className="text-xs text-amber-600">Requires attention</p>
                  </div>
                </div>
              )}
              {inventory.filter(item => (item.quantity || 0) <= (item.minQuantity || 5)).length > 0 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <Package className="w-4 h-4 mr-3 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Low Stock Alert</p>
                    <p className="text-xs text-blue-600">{inventory.filter(item => (item.quantity || 0) <= (item.minQuantity || 5)).length} items need restocking</p>
                  </div>
                </div>
              )}
              {employees.filter(emp => !emp.isActive).length > 0 && (
                <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                  <Users className="w-4 h-4 mr-3 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Employee Management</p>
                    <p className="text-xs text-green-600">{employees.filter(emp => !emp.isActive).length} inactive employees</p>
                  </div>
                </div>
              )}
              {(!stats.pendingOrders && inventory.filter(item => (item.quantity || 0) <= (item.minQuantity || 5)).length === 0 && employees.filter(emp => !emp.isActive).length === 0) && (
                <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">All Good!</p>
                    <p className="text-xs text-green-600">No urgent tasks at the moment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Shop Owner Help Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Need Help Managing Your Shop?</h3>
            <p className="text-gray-600 mb-6 text-lg">
              We're here to help you run your bakery efficiently. Access all the tools you need to manage orders, track performance, and grow your business! 🏪✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/shop-orders')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <Package className="w-5 h-5 mr-2" />
                Manage All Orders
              </button>
              <button
                onClick={() => navigate('/shop-analytics')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </button>
              <button
                onClick={() => navigate('/shop-settings')}
                className="bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 font-medium shadow-lg flex items-center justify-center"
              >
                <Settings className="w-5 h-5 mr-2" />
                Shop Settings
              </button>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <>


            {/* Recent Orders Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-blue-600" />
                  Recent Orders
                </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {recentOrders.length > 0 ? 
                      `Showing ${filteredOrders.length} of ${stats.totalOrders} total orders` : 
                      'No orders found'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Data source: Firebase Firestore • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/shop-orders')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl transition-all transform hover:scale-105 font-medium"
                >
                  View All Orders
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setLoading(true);
                    // Re-fetch data
                    const initializeShopDashboard = async () => {
                      try {
                        const shopId = currentUser.uid;
                        const ordersResult = await getShopOrders(shopId);
                        if (ordersResult.success) {
                          const allOrders = ordersResult.orders || [];
                          
                          // Recalculate stats
                          const totalOrders = allOrders.length;
                          const pendingOrders = allOrders.filter(order => 
                            ['pending', 'confirmed', 'preparing'].includes(order.status?.toLowerCase())
                          ).length;
                          const completedOrders = allOrders.filter(order => 
                            ['ready', 'delivered'].includes(order.status?.toLowerCase())
                          ).length;
                          
                          const totalRevenue = allOrders.reduce((sum, order) => {
                            const orderTotal = order.orderSummary?.total || order.total || 0;
                            return sum + (typeof orderTotal === 'number' ? orderTotal : parseFloat(orderTotal) || 0);
                          }, 0);
                          
                          const uniqueCustomers = new Set(allOrders.map(order => order.userId));
                          const activeCustomers = uniqueCustomers.size;
                          
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const todayOrders = allOrders.filter(order => {
                            const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || order.orderDate);
                            return orderDate >= today;
                          }).length;
                          
                          setStats({
                            totalOrders,
                            pendingOrders,
                            completedOrders,
                            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                            activeCustomers,
                            todayOrders
                          });
                          
                          const recentOrdersData = allOrders.slice(0, 5).map(order => ({
                            id: order.id,
                            customerName: order.userEmail || 'Customer',
                            items: order.items?.map(item => item.name || item.productName || 'Product') || ['Product'],
                            total: order.orderSummary?.total || order.total || 0,
                            status: order.status || order.orderStatus || 'pending',
                            createdAt: order.createdAt || order.orderDate,
                            trackingId: order.trackingId || order.id
                          }));
                          
                          setRecentOrders(recentOrdersData);
                          toast.success('Dashboard refreshed successfully!');
                        }
                      } catch (error) {
                        console.error('Error refreshing dashboard:', error);
                        toast.error('Failed to refresh dashboard');
                      } finally {
                        setLoading(false);
                      }
                    };
                    initializeShopDashboard();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-all transform hover:scale-105 font-medium flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                {filteredOrders.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium text-gray-900">{order.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-700 truncate">
                              {order.items.join(', ')}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">
                            ₹{order.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              disabled={updatingOrder === order.id}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(order.status)} ${updatingOrder === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {updatingOrder === order.id && (
                              <div className="ml-2">
                                <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                              </div>
                            )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Order"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditOrder(order.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Edit Order"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'Your shop hasn\'t received any orders yet. Orders will appear here once customers start placing them.'
                      }
                    </p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Employees Tab Content */}
        {activeTab === 'employees' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="w-6 h-6 mr-3 text-purple-600" />
                Employee Management
              </h2>
              <button
                onClick={openAddEmployee}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl transition-all transform hover:scale-105 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </button>
            </div>

            {loadingEmployees ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
                <p className="text-gray-500 mb-6">Start building your team by adding your first employee.</p>
                <button
                  onClick={openAddEmployee}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Employee
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                  <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {employee.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {employee.email}
                        </div>
                      )}
                      {employee.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {employee.phone}
                        </div>
                      )}
                      {employee.department && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Store className="w-4 h-4 mr-2" />
                          {employee.department}
                        </div>
                      )}
                      {employee.hourlyRate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ₹{employee.hourlyRate}/hr
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditEmployee(employee)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Store className="w-6 h-6 mr-3 text-green-600" />
                Inventory Management
              </h2>
              <button
                onClick={openAddInventory}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition-all transform hover:scale-105 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            {loadingInventory ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading inventory...</p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Items Found</h3>
                <p className="text-gray-500 mb-6">Start managing your inventory by adding your first item.</p>
                <button
                  onClick={openAddInventory}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.supplier && (
                            <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{item.sku || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{item.category || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${
                              (item.quantity || 0) <= (item.minQuantity || 5) ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {item.quantity || 0}
                            </span>
                            {(item.quantity || 0) <= (item.minQuantity || 5) && (
                              <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">
                            ₹{(item.unitPrice || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                            item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status === 'in_stock' ? 'In Stock' :
                             item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditInventory(item)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteInventory(item.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Employee Modal */}
        {showEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <input
                      type="text"
                      value={employeeForm.role}
                      onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Baker, Cashier, Manager"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={employeeForm.email}
                        onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={employeeForm.department}
                        onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Kitchen, Front Desk"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate
                      </label>
                      <input
                        type="number"
                        value={employeeForm.hourlyRate}
                        onChange={(e) => setEmployeeForm({...employeeForm, hourlyRate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={employeeForm.startDate}
                      onChange={(e) => setEmployeeForm({...employeeForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={employeeForm.isActive}
                      onChange={(e) => setEmployeeForm({...employeeForm, isActive: e.target.checked})}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Employee is active
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveEmployee}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                  <button
                    onClick={() => setShowEmployeeModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal */}
        {showInventoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold">
                  {editingInventory ? 'Edit Inventory Item' : 'Add New Item'}
                </h3>
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={inventoryForm.name}
                      onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter item name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={inventoryForm.sku}
                        onChange={(e) => setInventoryForm({...inventoryForm, sku: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Stock keeping unit"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={inventoryForm.category}
                        onChange={(e) => setInventoryForm({...inventoryForm, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Ingredients, Equipment"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={inventoryForm.quantity}
                        onChange={(e) => setInventoryForm({...inventoryForm, quantity: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        value={inventoryForm.unitPrice}
                        onChange={(e) => setInventoryForm({...inventoryForm, unitPrice: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Quantity
                      </label>
                      <input
                        type="number"
                        value={inventoryForm.minQuantity}
                        onChange={(e) => setInventoryForm({...inventoryForm, minQuantity: parseInt(e.target.value) || 5})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="5"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={inventoryForm.status}
                        onChange={(e) => setInventoryForm({...inventoryForm, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={inventoryForm.supplier}
                      onChange={(e) => setInventoryForm({...inventoryForm, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveInventory}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingInventory ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    onClick={() => setShowInventoryModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Confirmation Modal */}
        {showOrderConfirmationModal && selectedOrderForConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Order</h3>
                <button
                  onClick={() => setShowOrderConfirmationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Order ID:</strong> {selectedOrderForConfirmation.id}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Customer:</strong> {selectedOrderForConfirmation.customerName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Total:</strong> ₹{selectedOrderForConfirmation.total.toFixed(2)}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Time *
                </label>
                <input
                  type="text"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2-3 hours, Tomorrow by 2 PM, etc."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Notes (Optional)
                </label>
                <textarea
                  value={shopNotes}
                  onChange={(e) => setShopNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes for the customer..."
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmOrder}
                  disabled={loading || !estimatedDeliveryTime}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Confirming...' : 'Confirm Order'}
                </button>
                <button
                  onClick={() => setShowOrderConfirmationModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOwnerHome;
