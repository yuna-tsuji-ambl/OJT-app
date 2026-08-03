import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let emulatorConnected = false;

function readFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'localhost',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'ojt-app',
  };
}

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = initializeApp(readFirebaseConfig());
  }

  if (!auth) {
    auth = getAuth(app);
    const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
    if (emulatorHost && !emulatorConnected) {
      connectAuthEmulator(auth, `http://${emulatorHost}`, {
        disableWarnings: true,
      });
      emulatorConnected = true;
    }
  }

  return auth;
}
