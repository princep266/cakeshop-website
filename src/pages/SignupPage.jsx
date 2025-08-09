import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Store, Eye, EyeOff, Mail, Lock, UserPlus, ArrowLeft, MapPin, Phone, Building } from 'lucide-react';
import { signUpWithEmailAndPassword } from '../firebase/auth';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Shop-specific fields
    shopName: '',
    shopAddress: '',
    shopPhone: '',
    shopDescription: '',
    businessLicense: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate required fields for shop owners
    if (userType === 'shop') {
      const requiredFields = ['shopName', 'shopAddress', 'shopPhone', 'shopDescription', 'businessLicense'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill in all shop information fields');
        setLoading(false);
        return;
      }
    }
    
    try {
      const result = await signUpWithEmailAndPassword(formData.email, formData.password, {
        ...formData,
        userType
      });
      
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink/10 to-cake-cream/10 py-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-cake-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join The Noisy Cake Shop community</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to register as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  userType === 'customer'
                    ? 'border-cake-red bg-cake-red text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-cake-red/50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('shop')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  userType === 'shop'
                    ? 'border-cake-red bg-cake-red text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-cake-red/50'
                }`}
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">Shop Owner</span>
              </button>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Shop-specific fields */}
            {userType === 'shop' && (
              <div className="border-t pt-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Shop Information</h3>
                  <p className="text-sm text-gray-600">Tell us about your bakery or cake shop</p>
                </div>

                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                      placeholder="Enter your shop name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <textarea
                      id="shopAddress"
                      name="shopAddress"
                      value={formData.shopAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                      placeholder="Enter your shop address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shopPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="shopPhone"
                      name="shopPhone"
                      value={formData.shopPhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                      placeholder="Enter shop phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Description
                  </label>
                  <textarea
                    id="shopDescription"
                    name="shopDescription"
                    value={formData.shopDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="Tell us about your shop, specialties, and what makes you unique"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-2">
                    Business License Number
                  </label>
                  <input
                    type="text"
                    id="businessLicense"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="Enter your business license number"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="rounded border-gray-300 text-cake-red focus:ring-cake-red"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-cake-red hover:text-red-600 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-cake-red hover:text-red-600 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-cake-red hover:text-red-600 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
