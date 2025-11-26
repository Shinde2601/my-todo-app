import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBm4MD3ilVl9RSgh6y3U-C40PWOyhvrbLk",
    authDomain: "my-todo-app-b4c38.firebaseapp.com",
    projectId: "my-todo-app-b4c38",
    storageBucket: "my-todo-app-b4c38.firebasestorage.app",
    messagingSenderId: "1095762723648",
    appId: "1:1095762723648:web:f497be3160ac4591cd30a5",
    measurementId: "G-CHJ8LLC977"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);