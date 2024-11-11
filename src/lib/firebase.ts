import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBmD91luDCvU_6qgQbZGw36r8ORDNvelcY",
  authDomain: "projecttimeline-3d875.firebaseapp.com",
  projectId: "projecttimeline-3d875",
  storageBucket: "projecttimeline-3d875.firebasestorage.app",
  messagingSenderId: "117399810245",
  appId: "1:117399810245:web:0c0ca2c5f3e11abe7f40ac",
  measurementId: "G-PBELXPTWD2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser doesn\'t support offline persistence');
  }
});

// Set up security rules for Firestore
const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
`;