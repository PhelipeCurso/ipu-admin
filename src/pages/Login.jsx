import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const loginComGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider); // ✅ popup direto
      const user = result.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: user.displayName,
        email: user.email,
        tipo: 'admin'
      }, { merge: true });

      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow-sm">
        <h3 className="mb-3 text-center">Login - IPU Admin</h3>
        <button className="btn btn-primary w-100" onClick={loginComGoogle}>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
