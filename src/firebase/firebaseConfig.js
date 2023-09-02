// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdWB63toaaEG1MTZ6SDx3QSZbmoMLnUPg",
  authDomain: "fir-frontend-3fc0f.firebaseapp.com",
  projectId: "fir-frontend-3fc0f",
  storageBucket: "fir-frontend-3fc0f.appspot.com",
  messagingSenderId: "393271591464",
  appId: "1:393271591464:web:4a22eaa7720d31fba26b1d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
export const storage = getStorage(app);
