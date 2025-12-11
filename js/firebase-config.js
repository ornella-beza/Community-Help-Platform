// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getMessaging } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

const firebaseConfig = {
  apiKey: "AIzaSyBtsGIROOr-NlE1JassSmLWjTEh-lDoHf0",
  authDomain: "finance-management-d1d1e.firebaseapp.com",
  projectId: "finance-management-d1d1e",
  storageBucket: "finance-management-d1d1e.firebasestorage.app",
  messagingSenderId: "694376200550",
  appId: "1:694376200550:web:b095547de988ac1e4030a7",
  measurementId: "G-X47EZSKK2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;