import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export function subscribeDashboardSummary(callback, onError) {
  const ref = doc(db, "dashboard", "summary");

  return onSnapshot(
    ref,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export function subscribeRouterStatus(callback, onError) {
  const ref = doc(db, "routers", "mikrotik-main");

  return onSnapshot(
    ref,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export function subscribeEsp32Status(callback, onError) {
  const ref = doc(db, "devices", "esp32-main");

  return onSnapshot(
    ref,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export function subscribeRecentTransactions(callback, onError) {
  const ref = collection(db, "transactions");
  const q = query(ref, orderBy("createdAt", "desc"), limit(5));

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      callback(transactions);
    },
    onError
  );
}

export function subscribeActiveUsersCount(callback, onError) {
  const ref = collection(db, "users");
  const q = query(ref, where("status", "==", "active"));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    onError
  );
}