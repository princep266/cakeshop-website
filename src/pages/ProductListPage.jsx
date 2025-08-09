import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, Loader2, AlertCircle, Star, ShoppingCart } from 'lucide-react';
import { getProducts } from '../firebase/database';
import ProductCard from '../components/ProductCard';

const ProductListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getProducts();
        if (result.success) {
          setProducts(result.products);
        } else {
          setError(result.error || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Get unique categories from products
  const categories = [
    { id: 'all', name: 'All Products', icon: '🍰' },
    { id: 'cakes', name: 'Cakes', icon: '🎂' },
    { id: 'pastries', name: 'Pastries', icon: '🥐' },
    { id: 'sweets', name: 'Sweets', icon: '🍫' },
    { id: 'breads', name: 'Breads', icon: '🍞' },
    { id: 'seasonal', name: 'Seasonal', icon: '🎄' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-16">
            <div className="loading-spinner mb-6" />
            <p className="body-text text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h3 className="heading-3 text-gray-800 mb-4">Error Loading Products</h3>
            <p className="body-text text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero section-padding">
      <div className="max-width-container container-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-2 mb-6 text-gray-800">
            Our Products
          </h1>
          <p className="body-text text-gray-600 max-w-3xl mx-auto">
            Discover our delicious selection of cakes, pastries, and sweets. 
            Each product is crafted with love and the finest ingredients.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="card p-8 shadow-medium mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Category Filter */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Filter className="w-6 h-6 text-gray-500" />
                <span className="font-semibold text-gray-700">Categories:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`badge transition-all duration-300 ${
                    selectedCategory === 'All'
                      ? 'badge-primary shadow-medium'
                      : 'badge-secondary hover:badge-primary-hover'
                  }`}
                >
                  All Products
                </button>
                {categories.slice(1).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`badge transition-all duration-300 ${
                      selectedCategory === category.name
                        ? 'badge-primary shadow-medium'
                        : 'badge-secondary hover:badge-primary-hover'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-700">View:</span>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-cake-red text-white shadow-medium'
                        : 'bg-transparent text-gray-600 hover:text-cake-red hover:bg-white'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-cake-red text-white shadow-medium'
                        : 'bg-transparent text-gray-600 hover:text-cake-red hover:bg-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="body-text text-gray-600">
              Showing <span className="font-semibold text-cake-red">{sortedProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
            </div>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-cake-red hover:text-red-700 font-medium hover:bg-cake-pink/50 px-4 py-2 rounded-xl transition-all duration-300"
              >
                Clear Filter
              </button>
            )}
          </div>
          
          {viewMode === 'grid' ? (
            <div className="responsive-grid-4 gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedProducts.map((product) => (
                <div key={product.id} className="card card-hover overflow-hidden group relative">
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cake-red/5 to-cake-pink/10 rounded-2xl transition-opacity duration-300 z-10 pointer-events-none opacity-0 group-hover:opacity-100" />
                  
                  <div className="flex flex-col md:flex-row relative z-20">
                    {/* Image Section */}
                    <div className="md:w-1/3 relative overflow-hidden flex-shrink-0">
                      <div className="absolute top-4 left-4 z-30">
                        <span className="badge badge-primary shadow-medium group-hover:scale-110 transition-transform duration-300">
                          {product.category}
                        </span>
                      </div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content Section */}
                    <div className="md:w-2/3 p-8 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1 min-w-0">
                            <h3 className="heading-3 mb-4 group-hover:text-cake-red transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="body-text text-gray-600 mb-6 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                              {product.description}
                            </p>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-5 h-5 transition-all duration-300 ${
                                      i < Math.floor(product.rating || 4.5) 
                                        ? 'fill-yellow-400 text-yellow-400 group-hover:scale-110' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="body-text-small text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                                ({product.reviews || 12} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-3xl font-bold text-cake-red mb-6 group-hover:scale-110 transition-transform duration-300">
                          ${product.price}
                        </div>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="pt-6 border-t border-gray-100">
                        <button className="w-full gradient-primary hover:shadow-strong text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-medium flex items-center justify-center space-x-3">
                          <ShoppingCart className="w-5 h-5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-cake-red/30 rounded-2xl transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No Products Message */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce">🍰</div>
            <h3 className="heading-3 text-gray-800 mb-4">
              No products found
            </h3>
            <p className="body-text text-gray-600 mb-6">
              Try adjusting your filters or browse all products.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-primary"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
