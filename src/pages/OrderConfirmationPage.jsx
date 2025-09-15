import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { saveOrder } from '../firebase/database';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderData } = location.state || {};

  // Ensure order data is saved to the database WITHOUT embedding address/payment
  useEffect(() => {
    const ensureOrderSaved = async () => {
      if (!orderData) return;

      try {
        // If a real order was created previously, mark confirmation viewed only
        if (orderId && !String(orderId).startsWith('mock-')) {
          const existing = await getDoc(doc(db, 'orders', orderId));
          if (existing.exists()) {
            await setDoc(doc(db, 'orders', orderId), {
              confirmationViewed: true,
              lastUpdated: new Date().toISOString(),
            }, { merge: true });
            return;
          }
        }

        // Fallback: persist using the separated-collections pipeline
        console.log('Order not found or mock ID, persisting via saveOrder...');
        const result = await saveOrder(orderData);
        if (!result.success) {
          console.warn('Backup saveOrder failed:', result.error);
          return;
        }
        toast.info('Your order has been finalized.');
      } catch (error) {
        console.error('Error finalizing order after confirmation:', error);
      }
    };

    ensureOrderSaved();
  }, [orderId, orderData]);

  if (!orderId || !orderData) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="text-center py-20">
            <div className="text-8xl mb-8 text-red-500">❌</div>
            <h1 className="heading-1 mb-6">Order Not Found</h1>
            <p className="body-text mb-10">
              We couldn't find your order details. Please check your order history or contact support.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero section-padding">
      <div className="max-width-container container-padding">
        <div className="text-center mb-12">
          <div className="text-8xl mb-8 text-green-500">✅</div>
          <h1 className="heading-1 mb-6 text-green-600">Order Confirmed!</h1>
          <p className="body-text text-gray-600">
            Thank you for your order. We've received your request and will start preparing it right away.
          </p>
        </div>

        <div className="card shadow-strong p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4">Order Details</h2>
            <div className="text-3xl font-bold text-cake-red mb-2">
              Order #{orderId}
            </div>
            <div className="text-gray-600">
              Placed on {new Date(orderData.orderDate).toLocaleDateString()}
            </div>
          </div>

          <div className="responsive-grid-2 gap-8 mb-8">
            <div>
              <h3 className="heading-3 mb-4 flex items-center">
                <Package className="w-6 h-6 mr-3 text-cake-red" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{orderData.orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{orderData.orderSummary.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{orderData.orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-3">
                  <span>Total:</span>
                  <span className="text-cake-red">₹{orderData.orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="heading-3 mb-4 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-cake-red" />
                Shipping Address
              </h3>
              <div className="space-y-2 text-gray-700">
                <div>{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</div>
                <div>{orderData.shippingAddress.address}</div>
                <div>
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="heading-3 mb-4">What's Next?</h3>
            <div className="responsive-grid-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h4 className="font-semibold mb-2">Order Confirmed</h4>
                <p className="text-sm text-gray-600">We've received your order</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">👨‍🍳</div>
                <h4 className="font-semibold mb-2">Preparing</h4>
                <p className="text-sm text-gray-600">Our bakers are working on it</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🚚</div>
                <h4 className="font-semibold mb-2">Delivery</h4>
                <p className="text-sm text-gray-600">Estimated: {new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="btn-secondary"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
