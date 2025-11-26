// src/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        console.debug("onAuthStateChanged ->", u);
        setUser(u);
        setInitializing(false);
      },
      (err) => {
        console.error("onAuthStateChanged error:", err);
        setInitializing(false);
      }
    );
    return () => unsub();
  }, []);

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
  const signin = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const signout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, initializing, signup, signin, signInWithGoogle, signout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
