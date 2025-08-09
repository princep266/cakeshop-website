import React, { useState, useEffect } from 'react';
import { getProducts } from '../firebase/database';
import ProductCard from '../components/ProductCard';
import { Loader2, AlertCircle } from 'lucide-react';

const ProductGalleryPage = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cake-red mx-auto mb-4" />
            <p className="text-gray-600">Loading product gallery...</p>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Gallery</h3>
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
            Product Gallery
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore our complete collection of handcrafted cakes, pastries, and sweets. 
            Each product is carefully crafted with love and the finest ingredients to bring joy to your special moments.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Gallery Stats */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-cake-red mb-2">
                {products.length}
              </div>
              <div className="text-gray-600">Total Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cake-red mb-2">
                {products.filter(p => p.category === 'Cakes').length}
              </div>
              <div className="text-gray-600">Cakes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cake-red mb-2">
                {products.filter(p => p.category === 'Pastries').length}
              </div>
              <div className="text-gray-600">Pastries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cake-red mb-2">
                {products.filter(p => p.category === 'Sweets').length}
              </div>
              <div className="text-gray-600">Sweets</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGalleryPage;
