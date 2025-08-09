import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const ReviewsPage = () => {
  const { currentUser, userData, isCustomer, isShop } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadReviews();
  }, [currentUser, navigate]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use dummy data since we haven't implemented review fetching
      // In a real app, you would fetch reviews from Firebase
      const dummyReviews = [
        {
          id: 'REV001',
          productName: 'Chocolate Cake',
          rating: 5,
          comment: 'Absolutely delicious! The chocolate was rich and the cake was perfectly moist. Will definitely order again!',
          createdAt: new Date('2024-01-15'),
          helpful: 3
        },
        {
          id: 'REV002',
          productName: 'Vanilla Cupcakes',
          rating: 4,
          comment: 'Great cupcakes! The vanilla flavor was perfect and the frosting was not too sweet. Very satisfied with my order.',
          createdAt: new Date('2024-01-10'),
          helpful: 1
        },
        {
          id: 'REV003',
          productName: 'Red Velvet Cake',
          rating: 5,
          comment: 'This was the best red velvet cake I\'ve ever had! The cream cheese frosting was perfect and the cake was so fluffy.',
          createdAt: new Date('2024-01-05'),
          helpful: 5
        }
      ];

      setReviews(dummyReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cake-pink/10 to-cake-cream/10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cake-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink/10 to-cake-cream/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-cake-red rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Reviews</h1>
                <p className="text-gray-600">
                  {isShop ? 'Reviews for your products' : 'Your product reviews and ratings'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-cake-red transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">
              {isShop 
                ? "You haven't received any reviews yet." 
                : "You haven't written any reviews yet."
              }
            </p>
            <button
              onClick={() => navigate('/reviews')}
              className="btn-primary"
            >
              {isShop ? 'View Products' : 'Write Your First Review'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-xl p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{review.productName}</h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Reviewed on {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpful} found this helpful</span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-cake-red transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-cake-red transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(`/edit-review/${review.id}`)}
                    className="text-cake-red hover:text-red-600 font-medium"
                  >
                    Edit Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
