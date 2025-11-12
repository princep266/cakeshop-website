import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  MapPin,
  Phone,
  Mail,
  Package,
  Stamp,
  Calendar,
  Receipt
} from 'lucide-react';

const OrderInvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderData } = location.state || {};

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }),
    []
  );

  const formatCurrency = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

  if (!orderId || !orderData) {
    return (
      <div className="min-h-screen gradient-hero section-padding">
        <div className="max-width-container container-padding">
          <div className="card p-10 text-center space-y-6">
            <div className="text-7xl">📄</div>
            <h1 className="heading-2 text-cake-red">Invoice Unavailable</h1>
            <p className="text-gray-600">
              We could not find the invoice for this order. Please revisit your order history and try again.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go to My Orders</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shopDetails = {
    name: orderData.shopDetails?.name || 'Cake Shop Delight',
    email: orderData.shopDetails?.email || 'support@cakeshopdelight.com',
    phone: orderData.shopDetails?.phone || '+91 98765 43210',
    addressLine1: orderData.shopDetails?.addressLine1 || '12 Baker Street',
    addressLine2: orderData.shopDetails?.addressLine2 || 'Sweet City, CA 90210',
    gstin: orderData.shopDetails?.gstin || 'GSTIN: 27ABCDE1234F1Z5'
  };

  const invoiceNumber = orderData.invoiceNumber || `INV-${orderId}`;
  const orderDate = orderData.orderDate ? new Date(orderData.orderDate) : new Date();
  const estimatedDelivery = orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery) : null;
  const orderCreatedAt = orderData.orderDate ? new Date(orderData.orderDate) : orderDate;
  const paymentInfo = orderData.paymentInfo || {};
  const resolvedPaymentMethod =
    paymentInfo.method || paymentInfo.paymentMethod || orderData.paymentMethod || 'card';
  const paymentMethodLabel = (() => {
    switch (resolvedPaymentMethod) {
      case 'card':
        return paymentInfo.displayName || (paymentInfo.cardLast4 ? `Card •••• ${paymentInfo.cardLast4}` : 'Card Payment');
      case 'upi':
        return paymentInfo.displayName
          ? `UPI - ${paymentInfo.displayName}`
          : paymentInfo.upiId
            ? `UPI - ${paymentInfo.upiId}`
            : 'UPI Payment';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return resolvedPaymentMethod ? resolvedPaymentMethod.toUpperCase() : 'Payment';
    }
  })();
  const paymentStatusLabel = paymentInfo.status
    ? paymentInfo.status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Pending';

  const items = orderData.items || [];
  const shippingAddress = orderData.shippingAddress || {};
  const summary = orderData.orderSummary || {};
  const subtotal = summary.subtotal || 0;
  const shipping = summary.shipping || 0;
  const tax = summary.tax || 0;
  const discount = summary.couponDiscount || 0;
  const couponCode = summary.couponCode || null;
  const total = summary.total || 0;

  const isCod = resolvedPaymentMethod === 'cod';

  const paymentGuidance = isCod
    ? 'Please keep the exact payable amount ready. Our delivery executive will collect it on arrival.'
    : 'This transaction is processed securely via our PCI-compliant payment partner.';

  const handlePrint = () => window.print();
  const handleDownload = () => window.print();

  return (
    <div className="min-h-screen gradient-hero section-padding">
      <style>
        {`@media print {
          .no-print { display: none !important; }
          .invoice-container { box-shadow: none !important; border: none !important; }
          body { background: #fff !important; }
        }`}
      </style>
      <div className="max-width-container container-padding">
        <div className="no-print mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-cake-red transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="btn-secondary inline-flex items-center space-x-2 px-6 py-3"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="card invoice-container p-10 bg-white space-y-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-6 md:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-cake-red">
                <FileText className="w-10 h-10" />
                <div>
                  <h1 className="heading-2 text-cake-red">{shopDetails.name}</h1>
                  <p className="text-sm text-gray-500 tracking-wide uppercase flex items-center space-x-2">
                    <Stamp className="w-4 h-4" />
                    <span>Official Tax Invoice</span>
                  </p>
                </div>
              </div>
              <div className="text-gray-600 space-y-1">
                <div>{shopDetails.addressLine1}</div>
                <div>{shopDetails.addressLine2}</div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{shopDetails.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{shopDetails.email}</span>
                </div>
                <div className="text-sm text-gray-500">{shopDetails.gstin}</div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Invoice Number
                  </span>
                  <span className="text-lg font-bold text-gray-800">#{invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                  <div className="flex items-start justify-between">
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-cake-red" />
                      <span>Issued</span>
                    </span>
                    <span className="font-medium text-gray-800 text-right">
                      {orderDate.toLocaleDateString()} · {orderDate.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Order ID</span>
                    <span className="font-medium text-gray-800">{orderId}</span>
                  </div>
                  {orderData.trackingId && (
                    <div className="flex items-center justify-between">
                      <span>Tracking ID</span>
                      <span className="font-medium text-gray-800">{orderData.trackingId}</span>
                    </div>
                  )}
                  {estimatedDelivery && (
                    <div className="flex items-center justify-between">
                      <span>Estimated Delivery</span>
                      <span className="font-medium text-gray-800">
                        {estimatedDelivery.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Order Placed</span>
                    <span className="font-medium text-gray-800">
                      {orderCreatedAt.toLocaleDateString()} · {orderCreatedAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-cake-red" />
                <h2 className="heading-4">Bill To</h2>
              </div>
              <div className="text-gray-700 space-y-1">
                {(shippingAddress.firstName || shippingAddress.lastName) && (
                  <div className="font-semibold">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </div>
                )}
                {shippingAddress.address && <div>{shippingAddress.address}</div>}
                {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                  <div>
                    {[shippingAddress.city, shippingAddress.state, shippingAddress.zipCode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
                {orderData.contactInfo?.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{orderData.contactInfo.phone}</span>
                  </div>
                )}
                {orderData.contactInfo?.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{orderData.contactInfo.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Receipt className="w-5 h-5 text-cake-red" />
                <h2 className="heading-4">Payment Summary</h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Method</span>
                  <span className="font-semibold text-gray-800">{paymentMethodLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Status</span>
                  <span className="font-semibold text-gray-800">{paymentStatusLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Invoice Total</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Amount Due</span>
                  <span className="font-semibold text-cake-red">{formatCurrency(total)}</span>
                </div>
                {couponCode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">Coupon</span>
                    <span className="font-semibold text-gray-800">{couponCode}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-dashed border-gray-200">
                  <p className="text-xs leading-relaxed text-gray-500">{paymentGuidance}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={`${item.id}-${index}`}>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      {item.shopName && (
                        <div className="text-xs text-gray-500 mt-1">Sold by: {item.shopName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-6 md:space-y-0">
            <div className="max-w-md text-gray-600">
              <p className="font-semibold text-gray-800 mb-2">Notes</p>
              <p className="text-sm">
                Thank you for shopping with {shopDetails.name}! This invoice is generated automatically. Please keep a copy for your records.
              </p>
              {isCod && (
                <p className="text-sm mt-3 text-gray-500">
                  Cash on Delivery orders remain valid for 48 hours. Our team will reach out if we are unable to hand over the parcel during the first attempt.
                </p>
              )}
            </div>
            <div className="w-full md:w-96 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-cake-red">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-sm text-gray-500 space-y-2">
            <div>
              Need help with this invoice? Contact us at{' '}
              <span className="text-cake-red font-semibold">{shopDetails.email}</span> or call{' '}
              <span className="text-cake-red font-semibold">{shopDetails.phone}</span>.
            </div>
            <div>
              All prices are inclusive of applicable taxes unless stated otherwise. Returns or disputes must be raised
              within 48 hours of delivery.
            </div>
            <div className="uppercase tracking-[0.35em] text-center text-xs text-gray-400 mt-6">
              {shopDetails.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoicePage;

