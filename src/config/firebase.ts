import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBvOkBwRp6QiTlxL2Dd2ASAHFeCTXxr3xI",
  authDomain: "isaac-asimov-lab.firebaseapp.com",
  projectId: "isaac-asimov-lab",
  storageBucket: "isaac-asimov-lab.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;