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

  // Check for missing variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key]) => {
      const value = process.env[key];
      return !value || value.trim() === '';
    })
    .map(([key, description]) => `${description} (${key})`);

  if (missingVars.length > 0) {
    // Create a detailed error message
    const errorMessage = [
      'Firebase configuration error: Missing required environment variables.',
      '',
      'Missing variables:',
      ...missingVars.map(v => `- ${v}`),
      '',
      'Please add these to your .env.local file in the project root.',
      '',
      'Example .env.local content:',
      'NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id',
      'NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id',
    ].join('\n');

    // Log available variables for debugging (excluding sensitive data)
    const availableVars = Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'))
      .map(key => `${key}: ${key.includes('KEY') ? '***' : process.env[key]}`);
    
    if (availableVars.length > 0) {
      console.log('Available environment variables:', availableVars);
    }

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
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(
    'Failed to initialize Firebase. Please check your configuration.\n' +
    'Error: ' + errorMessage
  );
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider }; 