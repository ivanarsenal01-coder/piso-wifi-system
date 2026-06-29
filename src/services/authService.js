import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export async function loginAdmin(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    await signOut(auth);
    throw new Error("This account is not registered as an admin.");
  }

  const adminData = adminSnap.data();

  if (adminData.role !== "admin" || adminData.isActive !== true) {
    await signOut(auth);
    throw new Error("Admin account is inactive or invalid.");
  }

  return {
    uid: user.uid,
    email: user.email,
    ...adminData,
  };
}

export async function logoutAdmin() {
  await signOut(auth);
}