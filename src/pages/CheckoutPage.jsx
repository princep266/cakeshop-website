import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { saveOrder } from '../firebase/database';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle,
  Package,
  Calendar,
  Clock,
  Shield,
  Star
} from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const { items, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || currentUser?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    city: userData?.city || '',
    state: userData?.state || '',
    zipCode: userData?.zipCode || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        items: items,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone
        },
        paymentInfo: {
          cardNumber: formData.cardNumber.slice(-4), // Only store last 4 digits
          cardholderName: formData.cardholderName
        },
        orderSummary: {
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          total: total
        },
        status: 'pending',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const result = await saveOrder(orderData);
      
      if (result.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/order-confirmation', { 
          state: { 
            orderId: result.orderId,
            orderData: orderData
          } 
        });
      } else {
        toast.error(result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('An error occurred while placing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🔒</div>
            <h1 className="heading-1 mb-6">Please Log In</h1>
            <p className="body-text mb-10 max-w-2xl mx-auto">
              You need to be logged in to complete your purchase.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary inline-flex items-center space-x-3 text-lg px-10 py-4"
            >
              <Lock className="w-6 h-6" />
              <span>Login to Continue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🛒</div>
            <h1 className="heading-1 mb-6">Your Cart is Empty</h1>
            <p className="body-text mb-10 max-w-2xl mx-auto">
              Add some delicious treats to your cart before checking out.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary inline-flex items-center space-x-3 text-lg px-10 py-4"
            >
              <Package className="w-6 h-6" />
              <span>Start Shopping</span>
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
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-3 text-gray-600 hover:text-cake-red transition-colors font-medium hover:bg-cake-pink/50 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <div className="text-right">
            <h1 className="heading-2 text-cake-brown">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>

        <div className="responsive-grid-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Information */}
              <div className="card p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="heading-3">Personal Information</h2>
                    <p className="text-gray-600">Tell us about yourself</p>
                  </div>
                </div>
                
                <div className="responsive-grid-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your last name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center shadow-medium">
                    <MapPin className="w-6 h-6 text-cake-brown" />
                  </div>
                  <div>
                    <h2 className="heading-3">Shipping Address</h2>
                    <p className="text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="form-label">Street Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your street address"
                    />
                  </div>
                  
                  <div className="responsive-grid-3 gap-6">
                    <div>
                      <label htmlFor="city" className="form-label">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Enter your city"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="form-label">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Enter your state"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="card p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="heading-3">Payment Information</h2>
                    <p className="text-gray-600">Secure payment with SSL encryption</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="cardholderName" className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Name on card"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="form-label">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                  
                  <div className="responsive-grid-2 gap-6">
                    <div>
                      <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="form-label">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="gradient-primary hover:shadow-strong text-white font-bold py-6 px-16 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-medium text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6" />
                      <span>Place Order</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8 hover:shadow-strong transition-all duration-300 border-2 border-cake-pink/20">
              <div className="p-8">
                <h2 className="heading-3 mb-8 flex items-center">
                  <Package className="w-8 h-8 mr-4 text-cake-red" />
                  Order Summary
                </h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-gray-800 mb-4">Items ({items.length})</h3>
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-soft"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < Math.floor(item.rating || 4.5) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="text-xs text-gray-500">({item.reviews || 12})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cake-red">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-semibold">Subtotal</span>
                    <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600 font-semibold">Shipping</span>
                    </div>
                    <span className={`font-bold ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
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
                
                {/* Delivery Info */}
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 mb-6 hover:bg-blue-100 transition-colors duration-300">
                  <div className="flex items-center space-x-3 text-blue-700 mb-3">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">Estimated Delivery</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">7-10 business days</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-3 text-gray-500 text-sm">
                  <Shield className="w-5 h-5" />
                  <span>SSL Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
