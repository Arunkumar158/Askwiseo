import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Helper function to validate environment variables
function validateEnvVars() {
  const requiredEnvVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'Firebase API Key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'Firebase Project ID',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'Firebase Storage Bucket',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Messaging Sender ID',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'Firebase App ID',
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key]) => !process.env[key])
    .map(([key, description]) => `${description} (${key})`);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missingVars.join('\n')}\n\nPlease add them to your .env.local file.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Validate environment variables before initializing Firebase
validateEnvVars();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.error('Firebase config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '***' : 'undefined',
  });
  throw new Error('Failed to initialize Firebase. Please check your configuration and environment variables.');
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider }; 