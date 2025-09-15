import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShoppingCart, User, Store, Calendar, Mail,  
  Heart, Award, Clock, Truck, Shield, Sparkles, Tag, Percent, Gift, Zap,
  Play, CheckCircle2, TrendingUp,  Award as AwardIcon, ChefHat,
  ArrowUpRight
} from 'lucide-react';
import { getProducts } from '../firebase/database';
import { initializeProducts } from '../firebase/initializeData';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { currentUser, userData, isCustomer, isShop } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from Firebase
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        let result = await getProducts();
        if (result.success && result.products.length === 0) {
          try {
            // Auto-initialize demo data if no products found (dev convenience)
            await initializeProducts();
            result = await getProducts();
          } catch (initErr) {
            console.warn('Product initialization skipped/failed:', initErr);
          }
        }

        if (result.success) {
          const featured = (result.products || []).slice(0, 6);
          setFeaturedProducts(featured);
        } else {
          console.error('Error fetching featured products:', result.error);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Available offers and coupons
  const availableOffers = [
    {
      id: 'welcome10',
      code: 'WELCOME10',
      title: 'Welcome Discount',
      description: '10% off your first order',
      discount: '10%',
      type: 'percentage',
      icon: <Gift className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700'
    },
    {
      id: 'save20',
      code: 'SAVE20',
      title: 'Big Savings',
      description: '20% off orders above ₹50',
      discount: '20%',
      type: 'percentage',
      icon: <Percent className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      id: 'flat50',
      code: 'FLAT50',
      title: 'Flat Discount',
      description: '₹50 off orders above ₹100',
      discount: '₹50',
      type: 'fixed',
      icon: <Tag className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    },
    {
      id: 'freeship',
      code: 'FREESHIP',
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹30',
      discount: 'Free',
      type: 'shipping',
      icon: <Truck className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700'
    },
    {
      id: 'holiday15',
      code: 'HOLIDAY15',
      title: 'Holiday Special',
      description: '15% off holiday special',
      discount: '15%',
      type: 'percentage',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700'
    }
  ];

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fresh Daily",
      description: "All our cakes and pastries are baked fresh every morning"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Same-day delivery available for orders placed before 2 PM"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Guaranteed",
      description: "100% satisfaction guarantee on all our products"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Love",
      description: "Every creation is crafted with passion and care"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Customers" },
    { number: "50+", label: "Unique Recipes" },
    { number: "5★", label: "Average Rating" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 sm:py-20 md:py-24 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10"></div>
        <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
            <div className="text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold text-white shadow-strong border border-white/20 mb-6 sm:mb-8">
                <AwardIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-yellow-400" />
                <span className="hidden sm:inline">Award-Winning Bakery Since 2020</span>
                <span className="sm:hidden">Award-Winning Bakery</span>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-yellow-400" />
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.9] tracking-tight">
                  Sweet Dreams
                  <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Come True
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light px-4 sm:px-0">
                  Discover our handcrafted cakes and pastries that bring joy to every celebration. 
                  From birthdays to weddings, we make every moment special with our delicious creations.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 px-4 sm:px-0">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl shadow-strong hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="text-base sm:text-lg">Explore Products</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-soft hover:shadow-medium"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  <span className="text-base sm:text-lg">Watch Gallery</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 text-xs sm:text-sm text-gray-300 px-4 sm:px-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>Fresh Daily</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>100% Satisfaction</span>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10">
                {/* Main Cake Display */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl md:text-8xl lg:text-9xl shadow-hero">
                    🎂
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-medium animate-bounce">
                    ✨
                  </div>
                  <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-medium animate-bounce" style={{ animationDelay: '0.5s' }}>
                    🍰
                  </div>
                  <div className="absolute top-1/2 -left-6 sm:-left-8 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl shadow-medium animate-bounce" style={{ animationDelay: '1s' }}>
                    🧁
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4 sm:mb-6 px-4 sm:px-0">Excellence in Every Bite</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              We're committed to delivering the highest quality cakes and pastries with exceptional service that exceeds your expectations
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-emerald-500 to-teal-500',
                'from-orange-500 to-red-500'
              ];
              const hoverGradients = [
                'from-blue-600 to-cyan-600',
                'from-purple-600 to-pink-600',
                'from-emerald-600 to-teal-600',
                'from-orange-600 to-red-600'
              ];
              return (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 h-full">
                    {/* Icon Container */}
                    <div className="relative mb-4 sm:mb-6">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradients[index]} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-medium`}>
                        <div className="text-white text-lg sm:text-xl">
                          {feature.icon}
                        </div>
                      </div>
                      {/* Decorative Element */}
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]}/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Welcome Section */}
      {currentUser && (
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-strong border border-white/50 p-6 sm:p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 items-center">
                  <div className="lg:col-span-2">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-strong">
                          {isShop ? (
                            <Store className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                          ) : (
                            <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                          Welcome back, {userData?.firstName}! 👋
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 text-base sm:text-lg text-gray-600">
                          {isShop ? (
                            <>
                              <Store className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                              <span className="font-medium">Shop Owner Dashboard</span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                              <span className="font-medium">Customer Portal</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* User Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="group bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-medium transition-all duration-300">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Email Address</p>
                            <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{userData?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-medium transition-all duration-300">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Member Since</p>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatDate(userData?.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link
                        to="/profile"
                        className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl shadow-strong hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        <span className="text-sm sm:text-base">View Profile</span>
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Link>
                      {isShop && (
                        <Link
                          to="/shop-owner-home"
                          className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-soft"
                        >
                          <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          <span className="text-sm sm:text-base">Shop Dashboard</span>
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                      )}
                      {isCustomer && (
                        <Link
                          to="/orders"
                          className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-soft"
                        >
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                          <span className="text-sm sm:text-base">My Orders</span>
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-center lg:text-right mt-6 lg:mt-0">
                    <div className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold shadow-strong">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span>Verified Account</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Login/Signup Section for non-authenticated users */}
      {!currentUser && (
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-strong border border-white/50 p-8 sm:p-12 lg:p-16 text-center">
                {/* Icon */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-strong">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">Join Our Sweet Community</h3>
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
                    Create an account to order delicious cakes, track your orders, save your favorite products, 
                    and get exclusive access to special offers and new releases.
                  </p>
                  
                  {/* Benefits */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Track Orders</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Save Favorites</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Exclusive Offers</span>
                    </div>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                    <Link
                      to="/login"
                      className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-soft"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span className="text-base sm:text-lg">Login</span>
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                    <Link
                      to="/signup"
                      className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl shadow-strong hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span className="text-base sm:text-lg">Sign Up</span>
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Featured Products
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4 sm:mb-6 px-4 sm:px-0">
              Our Most Loved Creations
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Discover our most popular cakes and pastries that customers absolutely love. 
              Each creation is crafted with love, passion, and the finest ingredients.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6 sm:mb-8"></div>
                <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-transparent border-r-purple-500/40 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">Loading our delicious creations...</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Please wait while we fetch the best products for you</p>
            </div>
          ) : (
            <>
              {/* Featured Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} featured={true} />
                ))}
              </div>
              
              <div className="text-center">
                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl shadow-strong hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="text-base sm:text-lg">View All Products</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Offers & Coupons Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-strong">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Special Offers & Discounts
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4 sm:mb-6 px-4 sm:px-0">
              Save Big on Your Sweet Treats! 🎂
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Discover amazing discounts and offers on our delicious cakes and pastries. 
              Use these coupon codes at checkout to enjoy incredible savings!
            </p>
          </div>

          {/* Available Offers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20">
            {availableOffers.map((offer) => (
              <div
                key={offer.id}
                className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgColor} rounded-2xl sm:rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${offer.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-medium group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <div className="text-white text-lg sm:text-xl">
                        {offer.icon}
                      </div>
                    </div>
                    <div className={`text-right ${offer.textColor}`}>
                      <div className="text-2xl sm:text-3xl font-bold">{offer.discount}</div>
                      <div className="text-xs sm:text-sm font-semibold">OFF</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {offer.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {offer.description}
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <code className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-bold text-gray-800 border border-gray-200 group-hover:bg-gray-200 transition-colors duration-300">
                        {offer.code}
                      </code>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                        <span>Use at checkout</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-slate-900/90"></div>
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full -translate-x-24 sm:-translate-x-32 lg:-translate-x-48 -translate-y-24 sm:-translate-y-32 lg:-translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-purple-500/10 rounded-full translate-x-20 sm:translate-x-28 lg:translate-x-40 translate-y-20 sm:translate-y-28 lg:translate-y-40"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-pink-500/10 rounded-full -translate-x-16 sm:-translate-x-24 lg:-translate-x-32 -translate-y-16 sm:-translate-y-24 lg:-translate-y-32"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Ready to Experience Excellence?
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight px-4 sm:px-0">
            Ready to Taste the
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Difference?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Order now and experience the magic of our handcrafted cakes and pastries. 
            Perfect for any occasion - birthdays, weddings, celebrations, or just because!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-10 lg:mb-12">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              <span className="text-base sm:text-lg">Start Ordering</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link
              to="/gallery"
              className="group inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              <span className="text-base sm:text-lg">View Gallery</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-white/80">
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium">Free Delivery</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium">Fresh Daily</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium">100% Satisfaction</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
