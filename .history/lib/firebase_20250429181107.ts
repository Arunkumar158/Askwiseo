import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTeYio9RttlnkW5K2_LJHQ9RS8_I8NHCc",
  authDomain: "askwiseo.firebaseapp.com",
  projectId: "askwiseo",
  storageBucket: "askwiseo.firebasestorage.app",
  messagingSenderId: "667669394270",
  appId: "1:667669394270:web:03dc545c668970baffd5cf",
  measurementId: "G-NB231VHD6Q"
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, db }; 