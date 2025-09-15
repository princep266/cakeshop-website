import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Star, Package, Truck, CreditCard, Shield, CheckCircle, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CartPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Login Required
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Please log in to view your cart and place orders.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-cake-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-white text-cake-red border-2 border-cake-red py-3 px-6 rounded-lg font-semibold hover:bg-cake-red hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared successfully');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Start adding delicious treats to your cart!
            </p>
            <Link
              to="/products"
              className="inline-block bg-cake-red text-white py-3 px-8 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to="/products"
            className="flex items-center text-gray-700 hover:text-cake-red transition-all duration-300 font-medium group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </Link>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-300"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h1>
            </div>
            
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="flex h-52 sm:h-60">
                    {/* Image Section - Full Height */}
                    <div className="w-2/5 relative overflow-hidden">
                      <div className="absolute top-4 left-4 z-30">
                        <span className="bg-cake-red text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                          {item.category}
                        </span>
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    {/* Content Section */}
                    <div className="w-3/5 p-8 flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-cake-red transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 mb-4 text-base leading-relaxed">
                              {item.description}
                            </p>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-5 h-5 ${
                                      i < Math.floor(item.rating || 4.5) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                ({item.reviews || 12} reviews)
                              </span>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all duration-300 ml-4 flex-shrink-0 group-hover:scale-110"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <div className="text-3xl font-bold text-cake-red mb-6">
                          ₹{item.price}
                        </div>
                      </div>
                      
                      {/* Quantity and Total */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-6">
                          <span className="text-base font-semibold text-gray-700">Quantity:</span>
                          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-12 h-12 bg-gray-50 hover:bg-cake-red hover:text-white flex items-center justify-center transition-all duration-300 border-r border-gray-200"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-12 flex items-center justify-center bg-white">
                              <span className="text-xl font-bold text-gray-800">
                                {item.quantity}
                              </span>
                            </div>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-12 h-12 bg-gray-50 hover:bg-cake-red hover:text-white flex items-center justify-center transition-all duration-300 border-l border-gray-200"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">Item Total</div>
                          <div className="text-2xl font-bold text-cake-red">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold">Subtotal</span>
                  <span className="font-bold text-xl">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 font-semibold">Shipping</span>
                  </div>
                  <span className={`font-bold text-lg ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold">Tax</span>
                  <span className="font-bold text-lg">₹{tax.toFixed(2)}</span>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">Total</span>
                    <span className="text-3xl font-bold text-cake-red">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-center block mb-6 flex items-center justify-center space-x-3"
              >
                <CreditCard className="w-6 h-6" />
                <span>Proceed to Checkout</span>
              </Link>
              
              {/* Shipping Info */}
              <div className="p-5 bg-green-50 rounded-xl border border-green-200 mb-6">
                <div className="flex items-center space-x-3 text-green-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">
                    {shipping === 0 
                      ? 'Free shipping applied!' 
                      : `Free shipping on orders over ₹50`
                    }
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-3 text-gray-500 text-sm">
                <Shield className="w-5 h-5" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;