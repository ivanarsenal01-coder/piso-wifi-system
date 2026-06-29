const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const serviceAccount = require("../.secrets/serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seedFirestore() {
  const batch = db.batch();

  batch.set(
    db.doc("dashboard/summary"),
    {
      todayIncome: 0,
      activeUsers: 0,
      onlineDevices: 0,
      coinsToday: 0,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    db.doc("settings/main"),
    {
      appName: "Piso WiFi Management System",
      currency: "PHP",
      timezone: "Asia/Manila",
      maintenanceMode: false,
      allowRegistration: false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    db.doc("pricing/default"),
    {
      coin1Minutes: 10,
      coin5Minutes: 60,
      coin10Minutes: 150,
      pauseTimeEnabled: true,
      isActive: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    db.doc("routers/mikrotik-main"),
    {
      name: "Main MikroTik",
      ipAddress: "192.168.88.1",
      status: "offline",
      activeClients: 0,
      lastSeen: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    db.doc("devices/esp32-main"),
    {
      name: "ESP32 Coin Controller",
      type: "esp32",
      status: "offline",
      lastCoin: 0,
      lastSeen: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();

  console.log("✅ Firestore data successfully added/updated.");
  console.log("Collections created: dashboard, settings, pricing, routers, devices");
  process.exit(0);
}

seedFirestore().catch((error) => {
  console.error("❌ Firestore seed error:", error.message);
  process.exit(1);
});