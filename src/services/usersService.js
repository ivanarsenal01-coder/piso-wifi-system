import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const usersRef = collection(db, "users");

function getRemainingSecondsFromData(data) {
  if (data.status !== "active") {
    return Number(data.remainingSeconds || 0);
  }

  if (!data.expiresAt) {
    return Number(data.remainingSeconds || 0);
  }

  const expiresDate = data.expiresAt.toDate
    ? data.expiresAt.toDate()
    : new Date(data.expiresAt);

  const seconds = Math.ceil((expiresDate.getTime() - Date.now()) / 1000);

  return Math.max(0, seconds);
}

export function subscribeUsers(callback, onError) {
  const q = query(usersRef, orderBy("createdAt", "desc"), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      callback(users);
    },
    onError
  );
}

export async function addTestUser() {
  const randomIp = Math.floor(Math.random() * 200) + 20;
  const durationSeconds = 10 * 60;
  const expiresAt = new Date(Date.now() + durationSeconds * 1000);

  await addDoc(usersRef, {
    name: "Guest User",
    macAddress: "AA:BB:CC:DD:EE:FF",
    ipAddress: `192.168.88.${randomIp}`,
    deviceName: "Android Device",
    packageName: "PHP 1 / 10 mins",
    amountPaid: 1,
    timeAdded: 10,
    remainingSeconds: durationSeconds,
    remainingMinutes: 10,
    status: "active",
    startedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    lastSeen: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function pauseUser(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User session not found.");
  }

  const data = userSnap.data();

  if (data.status !== "active") {
    return;
  }

  const remainingSeconds = getRemainingSecondsFromData(data);

  await updateDoc(userRef, {
    status: "paused",
    remainingSeconds,
    remainingMinutes: Math.ceil(remainingSeconds / 60),
    expiresAt: null,
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });
}

export async function resumeUser(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User session not found.");
  }

  const data = userSnap.data();
  const remainingSeconds = Number(data.remainingSeconds || 0);

  if (remainingSeconds <= 0) {
    await expireUser(userId);
    return;
  }

  const expiresAt = new Date(Date.now() + remainingSeconds * 1000);

  await updateDoc(userRef, {
    status: "active",
    expiresAt: Timestamp.fromDate(expiresAt),
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });
}

export async function expireUser(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return;
  }

  const data = userSnap.data();

  if (data.status !== "active") {
    return;
  }

  await updateDoc(userRef, {
    status: "expired",
    remainingSeconds: 0,
    remainingMinutes: 0,
    expiresAt: null,
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });
}

export async function disconnectUser(userId) {
  await updateDoc(doc(db, "users", userId), {
    status: "disconnected",
    remainingSeconds: 0,
    remainingMinutes: 0,
    expiresAt: null,
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });
}

export async function deleteUser(userId) {
  await deleteDoc(doc(db, "users", userId));
}