import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingCart, User, Store, Calendar, Mail, Loader2 } from 'lucide-react';
import { getProducts } from '../firebase/database';
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
        const result = await getProducts();
        if (result.success) {
          // Get first 4 products as featured (or filter by isFeatured if available)
          const featured = result.products.slice(0, 4);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="responsive-grid-2 gap-16 items-center">
            <div>
              <h1 className="heading-1 mb-8 text-cake-brown">
                Sweet Dreams Come True
              </h1>
              <p className="body-text-large mb-10 text-gray-700">
                Discover our handcrafted cakes and pastries that bring joy to every celebration. 
                From birthdays to weddings, we make every moment special.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                <Link
                  to="/products"
                  className="btn-primary flex items-center justify-center space-x-3"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/gallery"
                  className="btn-secondary flex items-center justify-center space-x-3"
                >
                  <span>View Gallery</span>
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              </div>
              
              {/* Authentication Buttons or User Welcome */}
              {currentUser ? (
                <div className="card p-8 shadow-strong border-2 border-cake-pink/20">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
                      {isShop ? (
                        <Store className="w-8 h-8 text-white" />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="heading-3 text-gray-800">
                        Welcome back, {userData?.firstName}!
                      </h3>
                      <p className="body-text text-gray-600 flex items-center space-x-3">
                        {isShop ? (
                          <>
                            <Store className="w-5 h-5" />
                            <span>Shop Owner</span>
                          </>
                        ) : (
                          <>
                            <User className="w-5 h-5" />
                            <span>Customer</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="responsive-grid-2 gap-6 mb-6 text-sm">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="body-text text-gray-700">{userData?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="body-text text-gray-700">
                        Member since {formatDate(userData?.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/profile"
                      className="btn-primary text-center"
                    >
                      View Profile
                    </Link>
                    {isShop && (
                      <Link
                        to="/shop-dashboard"
                        className="btn-secondary text-center"
                      >
                        Shop Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    to="/login"
                    className="btn-secondary flex items-center justify-center space-x-3"
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary flex items-center justify-center space-x-3"
                  >
                    <Store className="w-5 h-5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="text-8xl text-center animate-bounce">🎂</div>
              <div className="absolute -top-4 -right-4 text-4xl animate-pulse">✨</div>
              <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse">🍰</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="max-width-container container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6 text-gray-800">
              Featured Products
            </h2>
            <p className="body-text text-gray-600 max-w-3xl mx-auto">
              Our most popular cakes and pastries that customers love. 
              Each creation is made with love and the finest ingredients.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="loading-spinner mb-6" />
              <p className="body-text text-gray-600">Loading featured products...</p>
            </div>
          ) : (
            <>
              <div className="responsive-grid-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link
                  to="/products"
                  className="btn-primary inline-flex items-center space-x-3"
                >
                  <span>View All Products</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-cake-cream">
        <div className="max-width-container container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6 text-gray-800">
              Why Choose The Noisy Cake Shop?
            </h2>
          </div>
          
          <div className="responsive-grid-3 gap-12">
            <div className="text-center group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="heading-4 mb-4 text-gray-800">
                Handcrafted with Love
              </h3>
              <p className="body-text text-gray-600">
                Every cake and pastry is carefully crafted by our expert bakers with passion and attention to detail.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🌱</div>
              <h3 className="heading-4 mb-4 text-gray-800">
                Fresh Ingredients
              </h3>
              <p className="body-text text-gray-600">
                We use only the finest, freshest ingredients to ensure the best taste and quality in every bite.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🚚</div>
              <h3 className="heading-4 mb-4 text-gray-800">
                Fast Delivery
              </h3>
              <p className="body-text text-gray-600">
                Quick and reliable delivery to your doorstep, ensuring your cakes arrive fresh and on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-cake-brown text-white">
        <div className="max-width-container container-padding text-center">
          <h2 className="heading-2 mb-6">
            Ready to Order Your Perfect Cake?
          </h2>
          <p className="body-text-large mb-10 text-gray-200">
            Browse our selection and find the perfect cake for your special occasion.
          </p>
          <Link
            to="/products"
            className="btn-secondary bg-white text-cake-brown hover:bg-gray-100 inline-flex items-center space-x-3"
          >
            <span>Start Ordering</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
