import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth + Firestore
  const [pdvUser, setPdvUser] = useState(null); // Firestore PDV user
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'usuarios', currentUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              ...data, // 🔹 agora inclui usaPDV e outros campos
            });
            setAdmin(data.tipo === 'admin');
          } else {
            setUser(null);
            setAdmin(false);
          }

          setPdvUser(null); // 🔹 zera o PDV login quando usa Firebase Auth
        } catch (err) {
          console.error('Erro ao buscar usuário:', err);
          setUser(null);
          setAdmin(false);
        }
      } else {
        setUser(null);
        setPdvUser(null);
        setAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const logout = () => {
    setPdvUser(null);
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, pdvUser, setPdvUser, admin, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
