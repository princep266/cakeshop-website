import React, { useState } from 'react';
import { Star, ShoppingCart, Eye, Heart, Clock, CheckCircle, ZoomIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleQuickView = () => {
    // Quick view functionality can be implemented here
    console.log('Quick view:', product.name);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div 
      className="card card-hover h-full flex flex-col group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Overlay - Covers entire card */}
      <div className={`absolute inset-0 bg-gradient-to-br from-cake-red/5 to-cake-pink/10 rounded-2xl transition-opacity duration-300 z-10 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Action Buttons */}
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className={`p-2.5 rounded-full transition-all duration-300 shadow-medium ${
            isWishlisted 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={handleQuickView}
          className={`p-2.5 rounded-full bg-white/90 text-gray-600 hover:bg-cake-red hover:text-white shadow-medium transition-all duration-300 hover:scale-110 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cake-pink/20 to-cake-cream/20 flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
        />
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-gradient-primary text-white rounded-full px-4 py-2 shadow-strong z-20 group-hover:scale-110 transition-transform duration-300">
          <span className="text-sm font-bold">
            ${product.price}
          </span>
        </div>

        {/* Stock Status */}
        <div className="absolute bottom-4 left-4 z-20">
          {product.inStock ? (
            <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-medium group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>In Stock</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-medium group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Image Overlay on Hover */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col relative z-10">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="badge badge-secondary group-hover:bg-cake-red group-hover:text-white transition-all duration-300">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="heading-3 mb-4 group-hover:text-cake-red transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="body-text-small mb-6 line-clamp-3 leading-relaxed flex-1 group-hover:text-gray-700 transition-colors duration-300">
          {product.description}
        </p>
        
        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex items-center flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 transition-all duration-300 ${
                    i < Math.floor(product.rating) 
                      ? 'fill-yellow-400 text-yellow-400 group-hover:scale-110' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700 flex-shrink-0 group-hover:text-cake-red transition-colors duration-300">
              {product.rating}
            </span>
            <span className="text-xs text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">
              ({product.reviews})
            </span>
          </div>
          
          <span className="text-2xl font-bold text-cake-red flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-300">
            ${product.price}
          </span>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 flex-shrink-0 relative overflow-hidden ${
            product.inStock
              ? 'gradient-primary hover:shadow-strong text-white shadow-medium'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {/* Button Background Animation */}
          <div className={`absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transform scale-x-0 transition-transform duration-300 ${
            isHovered ? 'scale-x-100' : 'scale-x-0'
          }`} />
          
          <ShoppingCart className="w-5 h-5 flex-shrink-0 relative z-10" />
          <span className="truncate relative z-10 font-medium">
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </span>
        </button>
      </div>

      {/* Success Animation */}
      {isHovered && (
        <div className="absolute inset-0 bg-green-500/10 border-2 border-green-500 rounded-2xl pointer-events-none animate-pulse z-30" />
      )}

      {/* Hover Border Effect */}
      <div className={`absolute inset-0 border-2 border-cake-red/30 rounded-2xl transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};

export default ProductCard;
