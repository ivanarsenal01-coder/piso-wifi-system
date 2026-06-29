import {
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

const usersRef = collection(db, "users");
const transactionsRef = collection(db, "transactions");
const pricingRef = doc(db, "pricing", "default");
const dashboardSummaryRef = doc(db, "dashboard", "summary");

function generateIpAddress() {
  const random = Math.floor(Math.random() * 200) + 20;
  return `192.168.88.${random}`;
}

function generateMacAddress() {
  return "AA:BB:CC:" + Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")
    .match(/.{1,2}/g)
    .join(":")
    .toUpperCase();
}

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

export async function createCoinSession(amount) {
  const pricing = await getPricingPackages();

  if (!pricing.isActive) {
    throw new Error("Pricing is currently inactive.");
  }

  let minutes = 0;

  if (amount === 1) {
    minutes = Number(pricing.coin1Minutes || 0);
  }

  if (amount === 5) {
    minutes = Number(pricing.coin5Minutes || 0);
  }

  if (amount === 10) {
    minutes = Number(pricing.coin10Minutes || 0);
  }

  if (minutes <= 0) {
    throw new Error("Invalid package minutes.");
  }

  const durationSeconds = minutes * 60;
  const expiresAt = new Date(Date.now() + durationSeconds * 1000);

  const userDoc = doc(usersRef);
  const transactionDoc = doc(transactionsRef);

  const macAddress = generateMacAddress();
  const ipAddress = generateIpAddress();

  const batch = writeBatch(db);

  batch.set(userDoc, {
    name: "Guest User",
    macAddress,
    ipAddress,
    deviceName: "Customer Device",
    packageName: `PHP ${amount} / ${minutes} mins`,
    amountPaid: amount,
    timeAdded: minutes,
    remainingSeconds: durationSeconds,
    remainingMinutes: minutes,
    status: "active",
    startedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    lastSeen: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(transactionDoc, {
    user: "Guest User",
    macAddress,
    amount,
    coinsInserted: 1,
    timeAdded: minutes,
    status: "completed",
    source: "captive-portal-test",
    createdAt: serverTimestamp(),
  });

  batch.set(
    dashboardSummaryRef,
    {
      todayIncome: increment(amount),
      coinsToday: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();

  return {
    amount,
    minutes,
    macAddress,
    ipAddress,
  };
}