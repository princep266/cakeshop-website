import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Sign up with email and password
export const signUpWithEmailAndPassword = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      userType: userData.userType,
      createdAt: new Date().toISOString(),
      ...(userData.userType === 'shop' && {
        shopInfo: {
          shopName: userData.shopName,
          shopAddress: userData.shopAddress,
          shopPhone: userData.shopPhone,
          shopDescription: userData.shopDescription,
          businessLicense: userData.businessLicense,
          isApproved: false, // Shop needs approval
          approvedAt: null
        }
      })
    });
    
    return {
      user,
      success: true,
      message: userData.userType === 'shop' ? 
        'Shop registration successful! Your account is pending approval.' :
        'Registration successful!'
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      user: null,
      success: false,
      message: error.message
    };
  }
};

// Sign in with email and password
export const signInUser = async (email, password, userType) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if user type matches
      if (userData.userType !== userType) {
        await signOut(auth);
        return {
          user: null,
          success: false,
          message: `Please sign in as a ${userData.userType}`
        };
      }
      
      // Check if shop is approved (for shop owners)
      if (userType === 'shop' && !userData.shopInfo?.isApproved) {
        await signOut(auth);
        return {
          user: null,
          success: false,
          message: 'Your shop account is pending approval. Please contact support.'
        };
      }
      
      return {
        user: { ...user, userData },
        success: true,
        message: 'Login successful!'
      };
    } else {
      await signOut(auth);
      return {
        user: null,
        success: false,
        message: 'User data not found'
      };
    }
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      user: null,
      success: false,
      message: error.message
    };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent!'
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid, updateData) => {
  try {
    await setDoc(doc(db, 'users', uid), updateData, { merge: true });
    return {
      success: true,
      message: 'Profile updated successfully!'
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
