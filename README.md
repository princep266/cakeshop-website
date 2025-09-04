# 🎂 Cake Shop - Comprehensive E-commerce Platform

A modern, full-featured cake shop e-commerce platform built with React, Firebase, and Tailwind CSS. This application provides comprehensive product management, order tracking, and delivery management for both customers and shop owners.

## ✨ Key Features

### 🏪 Shop Management
- **Product Management**: Add, edit, and manage products with detailed information
- **Inventory Tracking**: Real-time inventory management with stock alerts
- **Order Management**: Comprehensive order processing with status updates
- **Customer Management**: Track customer information and order history
- **Revenue Analytics**: Dashboard with sales statistics and revenue tracking

### 📦 Product Features
- **Detailed Product Information**: Ingredients, allergens, preparation time, serving size, calories
- **Product Categories**: Cakes, Pastries, Sweets, Breads, Seasonal items
- **Product Tags**: Gluten-free, vegan, organic, and custom tags
- **Image Management**: Product image upload and management
- **Featured Products**: Highlight special or seasonal items
- **Stock Management**: Real-time inventory tracking

### 🚚 Order & Delivery System
- **Order Tracking**: Unique tracking IDs for each order
- **Real-time Status Updates**: Order status tracking from pending to delivered
- **Delivery Management**: Comprehensive delivery tracking with location updates
- **Order Timeline**: Complete order history with timestamps
- **Shop Notes**: Internal notes for order management

### 👥 Customer Features
- **Order Tracking**: Real-time order status and delivery tracking
- **Product Reviews**: Customer reviews and ratings system
- **Order History**: Complete order history with details
- **User Profiles**: Customer profile management

### 🎯 Advanced Features
- **Real-time Updates**: Live order status and inventory updates
- **Search & Filter**: Advanced product and order filtering
- **Responsive Design**: Mobile-friendly interface
- **Firebase Integration**: Secure data storage and real-time synchronization

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **State Management**: React Context API
- **UI Components**: Lucide React Icons
- **Notifications**: React Toastify



## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cakeshop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```


5. **Start the development server**
   ```bash
   npm start
   ```

## 📱 Usage

### For Shop Owners

1. **Register/Login**: Create a shop account
2. **Add Products**: Use the comprehensive product form to add detailed product information
3. **Manage Orders**: View and update order statuses in real-time
4. **Track Deliveries**: Monitor delivery progress and update customer information
5. **Analytics**: View sales statistics and revenue data

### For Customers

1. **Browse Products**: View products by category with detailed information
2. **Place Orders**: Add items to cart and complete checkout
3. **Track Orders**: Use tracking ID to monitor order progress
4. **Leave Reviews**: Rate and review purchased products

## 🔧 Key Components

### Product Management
- **AddProduct.jsx**: Comprehensive product creation form
- **ProductCard.jsx**: Product display component
- **ProductListPage.jsx**: Product listing with filters

### Order Management
- **ShopDashboard.jsx**: Shop owner dashboard with order management
- **OrdersPage.jsx**: Comprehensive order management interface
- **OrderTrackingPage.jsx**: Real-time order tracking

### Database Functions
- **database.js**: Firebase database operations
- **auth.js**: Authentication functions
- **utils.js**: Utility functions for file uploads

## 🎨 Features in Detail

### Product Upload System
- **Comprehensive Form**: Detailed product information including ingredients, allergens, preparation time
- **Image Upload**: Product image management with preview
- **Category Management**: Organized product categories and subcategories
- **Inventory Tracking**: Real-time stock management
- **Product Tags**: Customizable tags for better organization

### Order Tracking System
- **Unique Tracking IDs**: Generated for each order (format: TRK-XXXXX)
- **Real-time Updates**: Live order status updates
- **Delivery Tracking**: Location-based delivery updates
- **Order Timeline**: Complete order history with timestamps
- **Customer Notifications**: Status updates for customers

### Shop Management
- **Order Confirmation**: Shop owners can confirm orders
- **Status Updates**: Update order status (pending → confirmed → preparing → ready → in_transit → delivered)
- **Delivery Management**: Track delivery progress and update locations
- **Customer Communication**: Internal notes and customer information
- **Revenue Tracking**: Sales analytics and revenue statistics

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **Role-based Access**: Different interfaces for customers and shop owners
- **Data Validation**: Input validation and error handling
- **Secure File Uploads**: Image upload with security checks

## 📊 Analytics & Reporting

- **Order Statistics**: Total orders, pending orders, revenue
- **Product Performance**: Sales tracking and inventory management
- **Customer Analytics**: Customer order history and preferences
- **Revenue Tracking**: Real-time revenue calculations

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

```



## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for the cake shop community**
