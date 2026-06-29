import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { loginAdmin } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    const adminData = await loginAdmin(email, password);
    setAdmin(adminData);
    return adminData;
  }

  async function logout() {
    await signOut(auth);
    setAdmin(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setAdmin(null);
          setLoading(false);
          return;
        }

        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          await signOut(auth);
          setAdmin(null);
          setLoading(false);
          return;
        }

        const adminData = adminSnap.data();

        if (adminData.role !== "admin" || adminData.isActive !== true) {
          await signOut(auth);
          setAdmin(null);
          setLoading(false);
          return;
        }

        setAdmin({
          uid: user.uid,
          email: user.email,
          ...adminData,
        });
      } catch {
        await signOut(auth);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}