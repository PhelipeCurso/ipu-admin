import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBVzjgKFARvnte6muUDi9tQTNTZuNeNp-0",
  authDomain: "ipu-admin.firebaseapp.com",
  projectId: "ipu-admin",
  storageBucket: "ipu-admin.appspot.com",
  messagingSenderId: "316599586169",
  appId: "1:316599586169:web:3679b01b8f615473eb73a8",
  // measurementId: "G-P6GSRF6D4W"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
    