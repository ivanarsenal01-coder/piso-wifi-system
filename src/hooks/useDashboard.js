import { useEffect, useState } from "react";
import {
  subscribeActiveUsersCount,
  subscribeDashboardSummary,
  subscribeEsp32Status,
  subscribeRecentTransactions,
  subscribeRouterStatus,
} from "../services/dashboardService";

function formatDate(value) {
  if (!value) return "Processing...";

  const date = value.toDate ? value.toDate() : new Date(value);

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTransactions(data) {
  return data.map((item) => ({
    id: item.id,
    user: item.user || "Guest User",
    amount: `PHP ${Number(item.amount || 0).toFixed(2)}`,
    timeAdded: `${item.timeAdded ?? 0} mins`,
    status: item.status || "pending",
    date: formatDate(item.createdAt),
  }));
}

function buildEarningsData(transactions) {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-PH", {
      weekday: "short",
    });

    days.push({
      key,
      label,
      income: 0,
    });
  }

  transactions.forEach((item) => {
    if (!item.createdAt) return;

    const date = item.createdAt.toDate
      ? item.createdAt.toDate()
      : new Date(item.createdAt);

    const key = date.toISOString().slice(0, 10);
    const day = days.find((entry) => entry.key === key);

    if (day) {
      day.income += Number(item.amount || 0);
    }
  });

  return days.map((day) => ({
    label: day.label,
    income: day.income,
  }));
}

export function useDashboard() {
  const [summary, setSummary] = useState({
    todayIncome: 0,
    activeUsers: 0,
    onlineDevices: 0,
    coinsToday: 0,
  });

  const [router, setRouter] = useState({
    name: "Main MikroTik",
    status: "offline",
    activeClients: 0,
  });

  const [esp32, setEsp32] = useState({
    name: "ESP32 Coin Controller",
    status: "offline",
    lastCoin: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [earningsData, setEarningsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let loadedCount = 0;

    function markLoaded() {
      loadedCount += 1;

      if (loadedCount >= 5) {
        setLoading(false);
      }
    }

    function handleError(err) {
      setError(err.message || "Failed to load dashboard data.");
      setLoading(false);
    }

    const unsubSummary = subscribeDashboardSummary((data) => {
      if (data) {
        setSummary((prev) => ({
          ...prev,
          todayIncome: data.todayIncome ?? 0,
          onlineDevices: data.onlineDevices ?? 0,
          coinsToday: data.coinsToday ?? 0,
        }));
      }

      markLoaded();
    }, handleError);

    const unsubActiveUsers = subscribeActiveUsersCount((count) => {
      setSummary((prev) => ({
        ...prev,
        activeUsers: count,
      }));

      markLoaded();
    }, handleError);

    const unsubRouter = subscribeRouterStatus((data) => {
      if (data) {
        setRouter({
          name: data.name ?? "Main MikroTik",
          status: data.status ?? "offline",
          activeClients: data.activeClients ?? 0,
        });
      }

      markLoaded();
    }, handleError);

    const unsubEsp32 = subscribeEsp32Status((data) => {
      if (data) {
        setEsp32({
          name: data.name ?? "ESP32 Coin Controller",
          status: data.status ?? "offline",
          lastCoin: data.lastCoin ?? 0,
        });
      }

      markLoaded();
    }, handleError);

    const unsubTransactions = subscribeRecentTransactions((data) => {
      setRecentTransactions(formatTransactions(data));
      setEarningsData(buildEarningsData(data));
      markLoaded();
    }, handleError);

    return () => {
      unsubSummary();
      unsubActiveUsers();
      unsubRouter();
      unsubEsp32();
      unsubTransactions();
    };
  }, []);

  return {
    summary,
    router,
    esp32,
    recentTransactions,
    earningsData,
    loading,
    error,
  };
}