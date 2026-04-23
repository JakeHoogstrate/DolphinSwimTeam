import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
  } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { auth, db } from "../firebase";
  
  export async function loginUser(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }
  
  export async function logoutUser() {
    await signOut(auth);
  }
  
  export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  export function subscribeToAuth(callback) {
    return onAuthStateChanged(auth, callback);
  }
  
  export async function getUserProfile(uid) {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
  
    if (!snapshot.exists()) return null;
  
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  }