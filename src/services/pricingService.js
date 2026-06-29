import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

const pricingRef = doc(db, "pricing", "default");

export function subscribePricing(callback, onError) {
  return onSnapshot(
    pricingRef,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    onError
  );
}

export async function updatePricing(data) {
  await setDoc(
    pricingRef,
    {
      coin1Minutes: Number(data.coin1Minutes) || 0,
      coin5Minutes: Number(data.coin5Minutes) || 0,
      coin10Minutes: Number(data.coin10Minutes) || 0,
      pauseTimeEnabled: Boolean(data.pauseTimeEnabled),
      isActive: Boolean(data.isActive),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}