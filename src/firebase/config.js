import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBVzjgKFARvnte6muUDi9tQTNTZuNeNp-0",
  authDomain: "ipu-admin.firebaseapp.com",
  projectId: "ipu-admin",
  storageBucket: "ipu-admin.appspot.com",
  messagingSenderId: "316599586169",
  appId: "1:316599586169:web:3679b01b8f615473eb73a8",
  // measurementId: "G-P6GSRF6D4W"
};

// Inicializar
const app = initializeApp(firebaseConfig);

// Serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔹 Provider do Google
const provider = new GoogleAuthProvider();

export { auth, db, storage, provider };
