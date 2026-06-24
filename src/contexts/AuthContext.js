import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import gravatarUrl from "../utils/gravatar";

const AuthContext = createContext(null);

async function ensureProfile(user) {
  if (!user) return;
  try {
    const ref = doc(db, "profiles", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        photoURL: user.photoURL || gravatarUrl(user.email),
        email: user.email,
        username: "",
        website: "",
        birthday: "",
        createdAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn("Profile sync skipped (rules may not be deployed yet):", e.message);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await ensureProfile(u);
        const snap = await getDoc(doc(db, "profiles", u.uid));
        const data = snap.data() || null;
        setProfile(data);
        setNeedsUsername(!data?.username);
      } else {
        setProfile(null);
        setNeedsUsername(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signUpWithEmail = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred;
  };

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsUsername,
        setNeedsUsername,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
