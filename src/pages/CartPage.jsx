import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Star, Package, Truck, CreditCard, Shield } from 'lucide-react';
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
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🔒</div>
            <h1 className="heading-1 mb-6">
              Please Log In
            </h1>
            <p className="body-text mb-10 max-w-2xl mx-auto">
              You need to be logged in to view your cart and place orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary inline-flex items-center space-x-3 text-lg px-10 py-4"
              >
                <ShoppingBag className="w-6 h-6" />
                <span>Login</span>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-secondary inline-flex items-center space-x-3 text-lg px-10 py-4"
              >
                <span>Sign Up</span>
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
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🛒</div>
            <h1 className="heading-1 mb-6">
              Your Cart is Empty
            </h1>
            <p className="body-text mb-10 max-w-2xl mx-auto">
              Looks like you haven't added any delicious treats to your cart yet.
            </p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center space-x-3 text-lg px-10 py-4"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Start Shopping</span>
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
    <div className="min-h-screen gradient-hero section-padding">
      <div className="max-width-container container-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <Link
              to="/products"
              className="flex items-center space-x-3 text-gray-600 hover:text-cake-red transition-colors font-medium hover:bg-cake-pink/50 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-soft"
          >
            Clear Cart
          </button>
        </div>

        <div className="responsive-grid-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="heading-2 mb-8 flex items-center">
              <ShoppingBag className="w-10 h-10 mr-4 text-cake-red" />
              Shopping Cart ({items.length} items)
            </h1>
            
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.id} className="card card-hover overflow-hidden group relative">
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cake-red/5 to-cake-pink/10 rounded-2xl transition-opacity duration-300 z-10 pointer-events-none opacity-0 group-hover:opacity-100" />
                  
                  <div className="flex flex-col md:flex-row relative z-20">
                    {/* Image Section */}
                    <div className="md:w-2/5 relative overflow-hidden flex-shrink-0">
                      <div className="absolute top-4 left-4 z-30">
                        <span className="badge badge-primary shadow-medium group-hover:scale-110 transition-transform duration-300">
                          {item.category}
                        </span>
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-56 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content Section */}
                    <div className="md:w-3/5 p-8 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1 min-w-0">
                            <h3 className="heading-3 mb-4 group-hover:text-cake-red transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="body-text-small mb-6 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                              {item.description}
                            </p>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 transition-all duration-300 ${
                                      i < Math.floor(item.rating || 4.5) 
                                        ? 'fill-yellow-400 text-yellow-400 group-hover:scale-110' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                                ({item.reviews || 12} reviews)
                              </span>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-full transition-all duration-300 ml-6 flex-shrink-0 group-hover:scale-110 hover:shadow-soft"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <div className="text-3xl font-bold text-cake-red mb-6 group-hover:scale-110 transition-transform duration-300">
                          ${item.price}
                        </div>
                      </div>
                      
                      {/* Quantity and Total */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-6">
                          <span className="text-sm font-semibold text-gray-600">Quantity:</span>
                          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-2 group-hover:bg-gray-100 transition-colors duration-300">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-10 h-10 rounded-full bg-white hover:bg-cake-red hover:text-white flex items-center justify-center transition-all duration-300 shadow-soft hover:scale-110 hover:shadow-medium"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-16 text-center font-bold text-gray-800 text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-10 h-10 rounded-full bg-white hover:bg-cake-red hover:text-white flex items-center justify-center transition-all duration-300 shadow-soft hover:scale-110 hover:shadow-medium"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">Item Total</div>
                          <div className="text-2xl font-bold text-cake-red group-hover:scale-110 transition-transform duration-300">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-cake-red/30 rounded-2xl transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8 hover:shadow-strong transition-all duration-300 border-2 border-cake-pink/20">
              <div className="p-8">
                <h2 className="heading-3 mb-8 flex items-center">
                  <Package className="w-8 h-8 mr-4 text-cake-red" />
                  Order Summary
                </h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Subtotal</span>
                    <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600 font-semibold">Shipping</span>
                    </div>
                    <span className={`font-bold ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Tax</span>
                    <span className="font-bold">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-bold text-cake-red">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/checkout"
                  className="w-full gradient-primary hover:shadow-strong text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-medium text-center block mb-6"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <CreditCard className="w-6 h-6" />
                    <span>Proceed to Checkout</span>
                  </div>
                </Link>
                
                <div className="p-5 bg-green-50 rounded-xl border border-green-200 mb-6 hover:bg-green-100 transition-colors duration-300">
                  <div className="flex items-center space-x-3 text-green-700">
                    <Package className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-semibold">
                      {shipping === 0 
                        ? 'Free shipping applied!' 
                        : `Free shipping on orders over $50`
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
    </div>
  );
};

export default CartPage;
