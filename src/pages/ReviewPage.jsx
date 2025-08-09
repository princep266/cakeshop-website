import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { getProducts, getAllReviews, addReview } from '../firebase/database';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReviewPage = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customerName: userData?.firstName ? `${userData.firstName} ${userData.lastName}` : '',
    productId: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products and reviews from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [productsResult, reviewsResult] = await Promise.all([
          getProducts(),
          getAllReviews()
        ]);
        
        if (productsResult.success && reviewsResult.success) {
          setProducts(productsResult.products);
          setReviews(reviewsResult.reviews);
        } else {
          setError('Failed to load data. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-8">Please log in to view and submit reviews.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        customerName: formData.customerName,
        productId: formData.productId || null,
        rating: formData.rating,
        comment: formData.comment,
        userId: currentUser.uid,
        createdAt: new Date()
      };

      const result = await addReview(reviewData);
      
      if (result.success) {
        toast.success('Review submitted successfully! Thank you for your feedback.');
        setFormData({
          customerName: userData?.firstName ? `${userData.firstName} ${userData.lastName}` : '',
          productId: '',
          rating: 5,
          comment: ''
        });
        
        // Refresh reviews
        const updatedReviewsResult = await getAllReviews();
        if (updatedReviewsResult.success) {
          setReviews(updatedReviewsResult.reviews);
        }
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cake-red mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews and products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Customer Reviews
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Read what our customers have to say about our delicious cakes and pastries. 
            We value your feedback and use it to improve our products and service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Form */}
          <div>
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Write a Review
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cake-red"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product (Optional)
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cake-red"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= formData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.rating} out of 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cake-red"
                    placeholder="Share your experience with our cakes and pastries..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center space-x-2 w-full py-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Reviews Display */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Customer Reviews ({reviews.length})
            </h2>
            
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {review.customerName}
                      </h3>
                      {review.productId && (
                        <p className="text-sm text-gray-600">
                          {getProductName(review.productId)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(review.createdAt?.toDate() || review.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{review.rating}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Review Stats */}
            <div className="card mt-8 bg-cake-cream">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Review Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-cake-red">
                    {reviews.length}
                  </div>
                  <div className="text-gray-600">Total Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cake-red">
                    {reviews.length > 0 
                      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Don't just take our word for it - hear from our satisfied customers!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎂</div>
              <h3 className="font-semibold text-gray-800 mb-2">Amazing Quality</h3>
              <p className="text-gray-600 text-sm">
                "The cakes are absolutely delicious and beautifully decorated. 
                Perfect for any celebration!"
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">🥐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Fresh & Delicious</h3>
              <p className="text-gray-600 text-sm">
                "The pastries are always fresh and the service is excellent. 
                Highly recommended!"
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">🍰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Perfect Service</h3>
              <p className="text-gray-600 text-sm">
                "Great customer service and the delivery was on time. 
                Will definitely order again!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
