import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCIBCgLGZAGSO2jNRRKjp5h69TD2-hG0zM",
  authDomain: "madalink-96f11.firebaseapp.com",
  projectId: "madalink-96f11",
  storageBucket: "madalink-96f11.firebasestorage.app",
  messagingSenderId: "808600559119",
  appId: "1:808600559119:web:e08a02560cbac50cd00d7a",
  measurementId: "G-LDJ6GCMXLV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;