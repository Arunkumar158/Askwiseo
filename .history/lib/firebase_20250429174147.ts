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

  // Debug: Log all environment variables (excluding sensitive data)
  console.log('Available environment variables:', 
    Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'))
      .map(key => `${key}: ${key.includes('KEY') ? '***' : process.env[key]}`)
  );

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key]) => {
      const value = process.env[key];
      return !value || value.trim() === '';
    })
    .map(([key, description]) => `${description} (${key})`);

  if (missingVars.length > 0) {
    const errorDetails = {
      message: 'Missing required environment variables',
      missingVariables: missingVars,
      availableVariables: Object.keys(process.env)
        .filter(key => key.startsWith('NEXT_PUBLIC_'))
    };

    console.error('Environment Variable Error:', errorDetails);
    throw new Error(
      `Firebase configuration error: Missing required environment variables.\n` +
      `Please add the following to your .env.local file:\n` +
      missingVars.map(v => `- ${v}`).join('\n')
    );
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

// Debug: Log the Firebase config (with sensitive data masked)
console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '***' : 'undefined',
});

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error(
    'Failed to initialize Firebase. Please check your configuration and environment variables.\n' +
    'Error details: ' + (error instanceof Error ? error.message : String(error))
  );
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider }; 