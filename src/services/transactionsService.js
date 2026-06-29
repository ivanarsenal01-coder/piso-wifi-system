import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

const transactionsRef = collection(db, "transactions");
const dashboardSummaryRef = doc(db, "dashboard", "summary");

export function subscribeTransactions(callback, onError) {
  const q = query(transactionsRef, orderBy("createdAt", "desc"), limit(50));

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

export async function addTestTransaction() {
  const batch = writeBatch(db);

  const amount = 1;
  const coinsInserted = 1;
  const timeAdded = 10;

  const transactionDoc = doc(transactionsRef);

  batch.set(transactionDoc, {
    user: "Guest User",
    macAddress: "00:00:00:00:00:00",
    amount,
    coinsInserted,
    timeAdded,
    status: "completed",
    source: "test",
    createdAt: serverTimestamp(),
  });

  batch.set(
    dashboardSummaryRef,
    {
      todayIncome: increment(amount),
      coinsToday: increment(coinsInserted),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();
}