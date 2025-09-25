import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // Firebase Auth user
  const [pdvUser, setPdvUser] = useState(null); // Firestore PDV user
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setPdvUser(null); // 🔹 se logou pelo Firebase, zera o PDV
        const docRef = doc(db, 'usuarios', currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAdmin(snap.data().tipo === 'admin');
        } else {
          setAdmin(false);
        }
      } else {
        setUser(null);
        setAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const logout = () => {
    setPdvUser(null); // 🔹 também limpa o PDV user
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, pdvUser, setPdvUser, admin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
