import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
} from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to update status in firestore
  const updateUserStatus = async (uid, status) => {
    if (!isFirebaseConfigured || !db) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        status: status,
        lastSeen: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error updating user status:", e);
    }
  };

  // Register function
  async function signup(email, password, displayName) {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Use a lovely DiceBear avatar seed
    const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`;
    
    await updateProfile(user, { displayName, photoURL });
    
    // Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName,
      email,
      password, // Store password in the database
      photoURL,
      status: "online",
      lastSeen: serverTimestamp(),
    });

    return user;
  }

  // Login function
  function login(email, password) {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured");
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Google Login
  async function loginWithGoogle() {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured");
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Save/Update user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName)}`,
      status: "online",
      lastSeen: serverTimestamp(),
    }, { merge: true });

    return user;
  }

  // Logout function
  async function logout() {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured");
    if (currentUser) {
      await updateUserStatus(currentUser.uid, "offline");
    }
    return signOut(auth);
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Mark online
        await updateUserStatus(user.uid, "online");
        
        // Setup beforeunload to set user offline when tab closes
        const handleUnload = () => {
          updateUserStatus(user.uid, "offline");
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => {
          window.removeEventListener("beforeunload", handleUnload);
        };
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
