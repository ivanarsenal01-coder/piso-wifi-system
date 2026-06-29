import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

async function deleteCollectionDocuments(collectionName) {
  const collectionRef = collection(db, collectionName);

  while (true) {
    const q = query(collectionRef, limit(400));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      break;
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();
  }
}

export async function resetTestData() {
  await deleteCollectionDocuments("users");
  await deleteCollectionDocuments("transactions");

  const batch = writeBatch(db);

  batch.set(
    doc(db, "dashboard", "summary"),
    {
      todayIncome: 0,
      activeUsers: 0,
      coinsToday: 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();
}