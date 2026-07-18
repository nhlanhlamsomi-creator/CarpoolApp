import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail as firebaseUpdateEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase.config';

const AuthContext = createContext(null);

function buildUserObject(fbUser, firestoreData) {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    fullName: fbUser.displayName || firestoreData?.fullName || '',
    phone: firestoreData?.phone || '',
    role: firestoreData?.role || 'passenger',
    rating: firestoreData?.rating ?? 0,
    verified: fbUser.emailVerified,
    ...firestoreData,
  };
}

function authErrorMessage(error) {
  if (!error?.code) return error?.message || 'Authentication failed. Please try again.';
  switch (error.code) {
    case 'auth/configuration-not-found':
      return 'Email/password sign-in is disabled for this Firebase project. Enable it under Authentication → Sign-in method.';
    case 'auth/email-already-in-use':
      return 'That email is already registered. Please log in or use a different email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(buildUserObject(fbUser, null));
      setLoading(false);

      getDoc(doc(db, 'users', fbUser.uid)).then((userDoc) => {
        const firestoreData = userDoc.exists() ? userDoc.data() : null;
        setUser(buildUserObject(fbUser, firestoreData));
      }).catch((error) => {
        console.warn('Failed to load user profile:', error);
      });
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = credential.user;
      const currentUser = buildUserObject(fbUser, null);
      setUser(currentUser);

      getDoc(doc(db, 'users', fbUser.uid)).then((userDoc) => {
        const firestoreData = userDoc.exists() ? userDoc.data() : null;
        setUser(buildUserObject(fbUser, firestoreData));
      }).catch((error) => {
        console.warn('Failed to load user profile:', error);
      });

      return currentUser;
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  };

  const register = async (form) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const fbUser = credential.user;

      const userDoc = {
        fullName: form.fullName || '',
        email: form.email,
        phone: form.phone || '',
        role: form.role || 'passenger',
        createdAt: serverTimestamp(),
      };

      const currentUser = buildUserObject(fbUser, userDoc);
      setUser(currentUser);

      Promise.allSettled([
        form.fullName ? updateProfile(fbUser, { displayName: form.fullName }) : Promise.resolve(),
        setDoc(doc(db, 'users', fbUser.uid), userDoc),
      ]).catch((backgroundError) => {
        console.warn('Background user save failed:', backgroundError);
      });

      return currentUser;
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateUser = async (updates) => {
    if (!user) throw new Error('No authenticated user available.');

    const userRef = doc(db, 'users', user.uid);

    if (updates.fullName) {
      await updateProfile(auth.currentUser, { displayName: updates.fullName });
    }
    if (updates.email && auth.currentUser?.email !== updates.email) {
      await firebaseUpdateEmail(auth.currentUser, updates.email);
    }

    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    const updatedUser = {
      ...user,
      ...updates,
      email: updates.email || user.email,
    };

    setUser(updatedUser);
    return updatedUser;
  };

  const isPassenger = user?.role === 'passenger';
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isPassenger,
      isDriver,
      isAdmin,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
