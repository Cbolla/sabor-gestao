import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC5QG9CzQlIGNrV8rZL-7uoSegXSfIbZmw",
    authDomain: "sabor-da-promessa.firebaseapp.com",
    projectId: "sabor-da-promessa",
    storageBucket: "sabor-da-promessa.firebasestorage.app",
    messagingSenderId: "542650817571",
    appId: "1:542650817571:web:e236c577c3d4b35a91e596",
    measurementId: "G-Y5ETYMXBVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, analytics, db, storage, auth };
