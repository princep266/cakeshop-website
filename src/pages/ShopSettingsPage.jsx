import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, ArrowLeft, Save, Store, MapPin, Phone, Mail, 
  Clock, Shield, Bell, CreditCard, Palette, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getUserData, updateUserProfile } from '../firebase/auth';

const ShopSettingsPage = () => {
  const { currentUser, userData, isShop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      shopName: '',
      shopDescription: '',
      shopPhone: '',
      shopEmail: '',
      shopAddress: '',
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      }
    },
    notifications: {
      newOrders: true,
      orderUpdates: true,
      customerReviews: true,
      lowStock: true,
      emailNotifications: true,
      smsNotifications: false
    },
    appearance: {
      theme: 'light',
      primaryColor: '#dc2626',
      accentColor: '#f59e0b',
      logo: null
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptUPI: true,
      acceptWallet: true,
      autoConfirmOrders: false,
      requirePaymentConfirmation: true
    }
  });

  useEffect(() => {
    if (!isShop) {
      navigate('/');
      return;
    }
  }, [isShop, navigate]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser || !isShop) return;
      
      try {
        setInitialLoading(true);
        const userDataResult = await getUserData(currentUser.uid);
        
        if (userDataResult) {
          // Load settings from user data
          const shopInfo = userDataResult.shopInfo || {};
          const shopSettings = userDataResult.shopSettings || {};
          
          setSettings(prev => ({
            general: {
              shopName: shopInfo.shopName || '',
              shopDescription: shopInfo.shopDescription || '',
              shopPhone: shopInfo.shopPhone || '',
              shopEmail: userDataResult.email || '',
              shopAddress: shopInfo.shopAddress || '',
              businessHours: shopSettings.businessHours || prev.general.businessHours
            },
            notifications: shopSettings.notifications || prev.notifications,
            appearance: shopSettings.appearance || prev.appearance,
            payment: shopSettings.payment || prev.payment
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Error loading settings: ' + error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [currentUser, isShop]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        shopInfo: {
          shopName: settings.general.shopName,
          shopDescription: settings.general.shopDescription,
          shopPhone: settings.general.shopPhone,
          shopAddress: settings.general.shopAddress
        },
        shopSettings: {
          businessHours: settings.general.businessHours,
          notifications: settings.notifications,
          appearance: settings.appearance,
          payment: settings.payment
        }
      };
      
      const result = await updateUserProfile(currentUser.uid, updateData);
      
      if (result.success) {
        toast.success('Settings saved successfully!');
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full flex items-center justify-center shadow-md">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Shop Settings</h1>
            </div>
          </div>
          
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                General
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'appearance'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'payment'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </div>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Store className="w-6 h-6 mr-3 text-blue-600" />
                General Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name</label>
                  <input
                    type="text"
                    value={settings.general.shopName}
                    onChange={(e) => handleSettingChange('general', 'shopName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter shop name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Phone</label>
                  <input
                    type="tel"
                    value={settings.general.shopPhone}
                    onChange={(e) => handleSettingChange('general', 'shopPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter shop phone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Email</label>
                  <input
                    type="email"
                    value={settings.general.shopEmail}
                    onChange={(e) => handleSettingChange('general', 'shopEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter shop email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Address</label>
                  <textarea
                    value={settings.general.shopAddress}
                    onChange={(e) => handleSettingChange('general', 'shopAddress', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter shop address"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Description</label>
                <textarea
                  value={settings.general.shopDescription}
                  onChange={(e) => handleSettingChange('general', 'shopDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Describe your shop..."
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Business Hours
                </h3>
                <div className="space-y-3">
                  {days.map((day) => (
                    <div key={day.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <span className="font-medium text-gray-700">{day.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!settings.general.businessHours[day.key].closed}
                          onChange={(e) => handleSettingChange('general', 'businessHours', {
                            ...settings.general.businessHours,
                            [day.key]: { ...settings.general.businessHours[day.key], closed: !e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>
                      {!settings.general.businessHours[day.key].closed && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={settings.general.businessHours[day.key].open}
                            onChange={(e) => handleSettingChange('general', 'businessHours', {
                              ...settings.general.businessHours,
                              [day.key]: { ...settings.general.businessHours[day.key], open: e.target.value }
                            })}
                            className="px-3 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={settings.general.businessHours[day.key].close}
                            onChange={(e) => handleSettingChange('general', 'businessHours', {
                              ...settings.general.businessHours,
                              [day.key]: { ...settings.general.businessHours[day.key], close: e.target.value }
                            })}
                            className="px-3 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Bell className="w-6 h-6 mr-3 text-blue-600" />
                Notification Settings
              </h2>
              
              <div className="space-y-6">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Palette className="w-6 h-6 mr-3 text-blue-600" />
                Appearance Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                    className="w-full h-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
                  <input
                    type="color"
                    value={settings.appearance.accentColor}
                    onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
                    className="w-full h-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload your shop logo</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Choose File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                Payment Settings
              </h2>
              
              <div className="space-y-6">
                {Object.entries(settings.payment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {key === 'acceptCash' && 'Accept cash payments'}
                        {key === 'acceptCard' && 'Accept credit/debit card payments'}
                        {key === 'acceptUPI' && 'Accept UPI payments'}
                        {key === 'acceptWallet' && 'Accept digital wallet payments'}
                        {key === 'autoConfirmOrders' && 'Automatically confirm new orders'}
                        {key === 'requirePaymentConfirmation' && 'Require payment confirmation before processing'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('payment', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopSettingsPage;
