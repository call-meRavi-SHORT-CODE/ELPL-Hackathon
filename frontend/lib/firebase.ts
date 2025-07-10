import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "<your_api_key>",
  authDomain: "elpl-1ac90.firebaseapp.com",
  projectId: "elpl-1ac90",
  storageBucket: "elpl-1ac90.firebasestorage.app",
  messagingSenderId: "1057189496620",
  appId: "1:1057189496620:web:037bdd91d4a11e398c4e89",
  measurementId: "G-3WMENZFDC4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ hd: "citchennai.net", prompt: "select_account" });
