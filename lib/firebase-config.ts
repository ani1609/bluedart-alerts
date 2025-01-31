// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFSiLEPzjw2pluEIBNoXOQuqF86dFR5HE",
  authDomain: "bluedart-alert.firebaseapp.com",
  projectId: "bluedart-alert",
  storageBucket: "bluedart-alert.firebasestorage.app",
  messagingSenderId: "882065453930",
  appId: "1:882065453930:web:a3765dda0615718e1e6b13",
  measurementId: "G-NBQYV1SENX",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
