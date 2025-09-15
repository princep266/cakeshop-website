import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, Loader2, AlertCircle, Heart, Award, Users, TrendingUp, Quote } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Join Our Community</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Share your experience and help others discover the perfect cakes and pastries. 
              Your feedback helps us create even better treats for everyone!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-8 py-4"
            >
              Login to Share Your Review
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
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-cake-red border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">Loading reviews and products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
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

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink via-cake-cream to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cake-red to-red-500 rounded-full mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Customer Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Read what our customers have to say about our delicious cakes and pastries. 
            We value your feedback and use it to improve our products and service.
          </p>
        </div>

        {/* Review Statistics Banner */}
        <div className="bg-white rounded-3xl shadow-strong p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cake-red mb-2">{reviews.length}</div>
              <div className="text-gray-600 font-medium">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cake-red mb-2">{getAverageRating()}</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cake-red mb-2">
                {reviews.length > 0 ? Math.round((ratingDistribution[5] / reviews.length) * 100) : 0}%
              </div>
              <div className="text-gray-600 font-medium">5-Star Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cake-red mb-2">
                {reviews.length > 0 ? Math.round((ratingDistribution[4] / reviews.length) * 100) : 0}%
              </div>
              <div className="text-gray-600 font-medium">4-Star Reviews</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-strong p-8 sticky top-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mr-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Write a Review</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Product (Optional)</label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    className="form-input"
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
                  <label className="form-label">Rating *</label>
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className="focus:outline-none transform hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= formData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {formData.rating} out of 5 stars
                  </span>
                </div>

                <div>
                  <label className="form-label">Your Review *</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows="5"
                    className="form-input resize-none"
                    placeholder="Share your experience with our cakes and pastries..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 flex items-center justify-center space-x-3"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Reviews Display */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Customer Reviews ({reviews.length})
              </h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Latest First</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-strong p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-cake-pink to-cake-cream rounded-full flex items-center justify-center mx-auto mb-6">
                    <Quote className="w-10 h-10 text-cake-red" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Be the First to Review!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Share your experience and help others discover our delicious treats. 
                    Your review will be featured here for everyone to see.
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-3xl shadow-strong p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {review.customerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {review.customerName}
                          </h3>
                          {review.productId && (
                            <p className="text-cake-red font-medium">
                              {getProductName(review.productId)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-gray-600 font-medium">{review.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Quote className="w-6 h-6 text-cake-red mb-3" />
                      <p className="text-gray-700 text-lg leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(review.createdAt?.toDate() || review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-cake-red" />
                        <span>Verified Customer</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <div className="bg-white rounded-3xl shadow-strong p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Rating Distribution</h3>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 w-16">
                      <span className="text-sm font-medium text-gray-600">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl shadow-strong p-8 text-center hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎂</span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-4">Amazing Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                "The cakes are absolutely delicious and beautifully decorated. 
                Perfect for any celebration!"
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-strong p-8 text-center hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🥐</span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-4">Fresh & Delicious</h3>
              <p className="text-gray-600 leading-relaxed">
                "The pastries are always fresh and the service is excellent. 
                Highly recommended!"
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-strong p-8 text-center hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cake-red to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🍰</span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-4">Perfect Service</h3>
              <p className="text-gray-600 leading-relaxed">
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
