import {
  initializeApp,
  getApps,
  getApp as getFirebaseAppInstance,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const isBrowser = typeof window !== "undefined";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;

const serverAuth = {
  currentUser: null,
} as unknown as Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!isBrowser) {
    throw new Error("Firebase client SDK is only available in the browser.");
  }
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables in Vercel (or .env.local)."
    );
  }
  if (!app) {
    app = getApps().length
      ? getFirebaseAppInstance()
      : initializeApp(firebaseConfig);
  }
  return app;
}

export function getAuthInstance(): Auth {
  if (!isBrowser) {
    return serverAuth;
  }
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getDbInstance(): Firestore {
  if (!isBrowser) {
    throw new Error("Firestore client SDK is only available in the browser.");
  }
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
}

export function getStorageInstance(): FirebaseStorage {
  if (!isBrowser) {
    throw new Error("Firebase Storage client SDK is only available in the browser.");
  }
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp());
  }
  return storageInstance;
}

function createLazyProxy<T extends object>(getInstance: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = getInstance();
      const value = Reflect.get(instance, prop, instance);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}


export const auth = createLazyProxy<Auth>(getAuthInstance);
export const db = createLazyProxy<Firestore>(getDbInstance);
export const storage = createLazyProxy<FirebaseStorage>(getStorageInstance);

export default createLazyProxy<FirebaseApp>(getFirebaseApp);
