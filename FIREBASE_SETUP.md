# Firebase Setup Instructions for The Noisy Cake Shop

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "noisy-cake-shop" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Set up Firebase Authentication

1. In the Firebase console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Configure authorized domains for production

## 3. Set up Firestore Database

1. Go to **Firestore Database** in the Firebase console
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click "Done"

## 4. Set up Firebase Storage

1. Go to **Storage** in the Firebase console
2. Click "Get started"
3. Choose **Start in test mode**
4. Select a location
5. Click "Done"

## 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click on the web app icon (`</>`)
4. Register your app with name "noisy-cake-shop-web"
5. Copy the Firebase configuration object

## 6. Update Firebase Configuration

Replace the placeholder values in `src/firebase/config.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 7. Initialize Database with Sample Data

Add this to your main App component to initialize sample data:

```javascript
import { initializeAllData } from './firebase/initializeData';

// Call this once to populate the database
const initializeData = async () => {
  const result = await initializeAllData();
  console.log(result.message);
};

// Uncomment and run once to initialize data
// initializeData();
```

## 8. Set up Firestore Security Rules

In the Firebase console, go to **Firestore Database** > **Rules** and update with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by all, writable by shop owners
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'shop';
    }
    
    // Orders are readable/writable by the order owner or shop
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'shop');
    }
    
    // Reviews are readable by all, writable by authenticated users
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Categories and settings are readable by all, writable by admins
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';
    }
  }
}
```

## 9. Set up Firebase Storage Rules

Go to **Storage** > **Rules** and update with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 10. Environment Variables (Optional)

For security, you can use environment variables for Firebase config:

Create `.env.local` file:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Then update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## 11. Database Collections Structure

The application uses these Firestore collections:

- **users**: User profiles and authentication data
- **products**: Cake and pastry product information
- **orders**: Customer orders and order tracking
- **reviews**: Product reviews and ratings
- **categories**: Product categories
- **settings**: Shop configuration and settings

## 12. Testing the Setup

1. Run your React application: `npm start`
2. Test user registration (both customer and shop)
3. Test user login
4. Initialize sample data by uncommenting the initialization code
5. Verify data appears in Firestore console

## Features Included

✅ **Authentication**: Email/password signup and login
✅ **User Types**: Customer and Shop owner roles
✅ **Product Management**: CRUD operations for products
✅ **Order Management**: Create, track, and manage orders
✅ **Reviews System**: Add and view product reviews
✅ **Cart Persistence**: Save cart across devices
✅ **File Upload**: Image upload for products
✅ **Real-time Updates**: Live data synchronization
✅ **Search & Filter**: Product search and filtering
✅ **Shop Management**: Shop owner dashboard features

## Troubleshooting

- **"Permission denied"**: Check Firestore security rules
- **"Project not found"**: Verify Firebase configuration
- **"Network error"**: Check internet connection and Firebase status
- **"Missing data"**: Run database initialization script

For more help, check the [Firebase Documentation](https://firebase.google.com/docs).
