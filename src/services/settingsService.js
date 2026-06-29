import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

const settingsRef = doc(db, "settings", "main");
const routerRef = doc(db, "routers", "mikrotik-main");
const esp32Ref = doc(db, "devices", "esp32-main");

export function subscribeSettings(callback, onError) {
  return onSnapshot(
    settingsRef,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export function subscribeRouter(callback, onError) {
  return onSnapshot(
    routerRef,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export function subscribeEsp32(callback, onError) {
  return onSnapshot(
    esp32Ref,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export async function updateSettings(data) {
  await setDoc(
    settingsRef,
    {
      appName: data.appName || "Piso WiFi Management System",
      currency: data.currency || "PHP",
      timezone: data.timezone || "Asia/Manila",
      maintenanceMode: Boolean(data.maintenanceMode),
      allowRegistration: Boolean(data.allowRegistration),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateRouter(data) {
  await setDoc(
    routerRef,
    {
      name: data.name || "Main MikroTik",
      ipAddress: data.ipAddress || "192.168.88.1",
      status: data.status || "offline",
      activeClients: Number(data.activeClients) || 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateEsp32(data) {
  await setDoc(
    esp32Ref,
    {
      name: data.name || "ESP32 Coin Controller",
      type: data.type || "esp32",
      status: data.status || "offline",
      lastCoin: Number(data.lastCoin) || 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}