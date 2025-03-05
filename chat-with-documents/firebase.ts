// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getStorage} from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQfRJZoBBgSpriDgwJDygV7vo5mzEuzW8",
  authDomain: "chat-with-documents-c1c39.firebaseapp.com",
  projectId: "chat-with-documents-c1c39",
  storageBucket: "chat-with-documents-c1c39.firebasestorage.app",
  messagingSenderId: "961092893293",
  appId: "1:961092893293:web:779f62e82178fd86231d64",
  measurementId: "G-3KYZ89MQZB"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

const app = getApps().length === 0 ?  initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);

const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage};