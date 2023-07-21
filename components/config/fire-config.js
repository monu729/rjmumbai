// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4TH5WFszn8TmoE8KQSnet3zCtbHZAWRw",
  authDomain: "rjmumbai-40ce6.firebaseapp.com",
  projectId: "rjmumbai-40ce6",
  storageBucket: "rjmumbai-40ce6.appspot.com",
  messagingSenderId: "375405394798",
  appId: "1:375405394798:web:9832f10d0d41793d60df7f",
  measurementId: "G-0H7P5MRQ88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Get Firestore instance
const db = getFirestore(app);
export { db };
