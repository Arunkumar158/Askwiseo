import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTeYio9RttlnkW5K2_LJHQ9RS8_I8NHCc",
  authDomain: "askwiseo.firebaseapp.com",
  projectId: "askwiseo",
  storageBucket: "askwiseo.firebasestorage.app",
  messagingSenderId: "667669394270",
  appId: "1:667669394270:web:03dc545c668970baffd5cf",
  measurementId: "G-NB231VHD6Q"
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing required fields');
}

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Initialize Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Initialize Firestore with persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Add error listener for Firestore
db.onError = (error) => {
  console.error('Firestore error:', error);
};

export { auth, googleProvider, db, storage }; 