import React, { useState, useEffect } from 'react';
import { getProductsByCategory } from '../firebase/database';
import ProductCard from '../components/ProductCard';
import { Loader2, AlertCircle } from 'lucide-react';

const PastryAndSweetsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products and filter for Pastries and Sweets
        const result = await getProductsByCategory();
        if (result.success) {
          const pastriesAndSweets = result.products.filter(product => 
            product.category === 'Pastries' || product.category === 'Sweets'
          );
          setProducts(pastriesAndSweets);
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

  const categories = [
    { name: 'All', count: products.length },
    { name: 'Pastries', count: products.filter(p => p.category === 'Pastries').length },
    { name: 'Sweets', count: products.filter(p => p.category === 'Sweets').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cake-red mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Products</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-cake-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Pastries & Sweets
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Indulge in our delightful selection of pastries and sweets. 
            From flaky croissants to decadent chocolates, we have something to satisfy every sweet tooth.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-cake-red text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥐</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or browse all products.
            </p>
          </div>
        )}

        {/* Special Offers Section */}
        <div className="mt-16 bg-gradient-to-r from-cake-pink to-cake-cream rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-cake-brown mb-4">
              Special Offers
            </h2>
            <p className="text-gray-700 mb-6">
              Get 10% off when you order 3 or more pastries or sweets!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl mb-2">🎂</div>
                <h3 className="font-semibold text-gray-800">Birthday Special</h3>
                <p className="text-gray-600">Free decoration on birthday cakes</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl mb-2">📦</div>
                <h3 className="font-semibold text-gray-800">Bulk Orders</h3>
                <p className="text-gray-600">Discount on orders over $50</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="font-semibold text-gray-800">Party Packs</h3>
                <p className="text-gray-600">Special pricing for events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastryAndSweetsPage;
