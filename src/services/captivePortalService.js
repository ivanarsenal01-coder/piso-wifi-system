import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const pricingRef = doc(db, "pricing", "default");

export async function getPricingPackages() {
  const pricingSnap = await getDoc(pricingRef);

  if (!pricingSnap.exists()) {
    return {
      coin1Minutes: 10,
      coin5Minutes: 60,
      coin10Minutes: 150,
      isActive: true,
    };
  }

  return pricingSnap.data();
}