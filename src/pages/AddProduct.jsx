import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, ArrowLeft, Package, Tag, DollarSign, Info, CheckCircle, Link } from 'lucide-react';
import { addProduct } from '../firebase/database';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const { currentUser, isShop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    inStock: true,
    inventory: '',
    image: '',
    ingredients: '',
    allergens: '',
    preparationTime: '',
    servingSize: '',
    calories: '',
    isFeatured: false,
    isSeasonal: false,
    tags: []
  });

  // Check if user is authorized
  if (!currentUser || !isShop) {
    navigate('/login');
    return null;
  }

  const categories = [
    { name: 'Cakes', subcategories: ['Birthday Cakes', 'Wedding Cakes', 'Custom Cakes', 'Cupcakes', 'Cheesecakes'] },
    { name: 'Pastries', subcategories: ['Croissants', 'Danish Pastries', 'Eclairs', 'Tarts', 'Pies'] },
    { name: 'Sweets', subcategories: ['Chocolates', 'Candies', 'Cookies', 'Brownies', 'Fudge'] },
    { name: 'Breads', subcategories: ['Artisan Bread', 'Sandwich Bread', 'Sweet Bread', 'Baguettes', 'Rolls'] },
    { name: 'Seasonal', subcategories: ['Holiday Specials', 'Valentine\'s Day', 'Easter', 'Christmas', 'Halloween'] }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const validateImageUrl = (url) => {
    if (!url) return true; // Allow empty URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate image URL if provided
      if (imageUrl && !validateImageUrl(imageUrl)) {
        toast.error('Please enter a valid image URL');
        setLoading(false);
        return;
      }

      toast.info('Saving product to database...');

      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory),
        image: imageUrl, // Use the image URL directly
        shopId: currentUser.uid,
        rating: 0,
        reviews: 0,
        totalSold: 0,
        averageRating: 0,
        reviewCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add product to database
      const result = await addProduct(productData);
      
      if (result.success) {
        toast.success('Product added successfully!');
        setTimeout(() => {
          navigate('/shop-dashboard');
        }, 1000);
      } else {
        toast.error(result.error || 'Error adding product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cake-pink/10 to-cake-cream/10 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/shop-dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-cake-red transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Product</h1>
          <p className="text-gray-600">Add a new product to your shop with comprehensive details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
              
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Enter product name"
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Describe your product in detail"
                  required
                  disabled={loading}
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    required
                    disabled={loading}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory */}
              {selectedCategory && (
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    disabled={loading}
                  >
                    <option value="">Select subcategory</option>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Inventory and Stock */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Inventory & Stock
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
                    Inventory Quantity *
                  </label>
                  <input
                    type="number"
                    id="inventory"
                    name="inventory"
                    value={formData.inventory}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="0"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="inStock"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-cake-red focus:ring-cake-red"
                    disabled={loading}
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    In Stock
                  </label>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Product Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="List main ingredients"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <textarea
                    id="allergens"
                    name="allergens"
                    value={formData.allergens}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="List allergens (e.g., nuts, dairy, gluten)"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    id="preparationTime"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="e.g., 30 minutes"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    id="servingSize"
                    name="servingSize"
                    value={formData.servingSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="e.g., 1 slice, 6 pieces"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
                    Calories (per serving)
                  </label>
                  <input
                    type="number"
                    id="calories"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                    placeholder="0"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags & Features
              </h2>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  onKeyPress={handleTagInput}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="Press Enter to add tags (e.g., gluten-free, vegan, organic)"
                  disabled={loading}
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-cake-red text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-200"
                          disabled={loading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-cake-red focus:ring-cake-red"
                    disabled={loading}
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured Product
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isSeasonal"
                    name="isSeasonal"
                    checked={formData.isSeasonal}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-cake-red focus:ring-cake-red"
                    disabled={loading}
                  />
                  <label htmlFor="isSeasonal" className="text-sm font-medium text-gray-700">
                    Seasonal Product
                  </label>
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Link className="w-5 h-5 mr-2" />
                Product Image
              </h2>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cake-red focus:border-transparent transition-all duration-300"
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a direct link to your product image (e.g., from Imgur, Google Drive, or any image hosting service)
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      toast.error('Failed to load image. Please check the URL.');
                    }}
                  />
                  <p className="text-sm text-gray-600 mt-2">Image Preview</p>
                </div>
              )}

              {/* Image Hosting Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Free Image Hosting Services:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Imgur:</strong> Upload at imgur.com and copy the direct link</li>
                  <li>• <strong>Google Drive:</strong> Upload image, right-click → "Get link"</li>
                  <li>• <strong>Dropbox:</strong> Upload and share with direct link</li>
                  <li>• <strong>GitHub:</strong> Upload to a repository and use raw link</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cake-red to-red-500 hover:from-red-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding Product...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
