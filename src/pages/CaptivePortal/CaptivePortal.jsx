import { useEffect, useState } from "react";
import { Coins, Wifi, CheckCircle2 } from "lucide-react";
import {
  createCoinSession,
  getPricingPackages,
} from "../../services/captivePortalService";

function CaptivePortal() {
  const [pricing, setPricing] = useState({
    coin1Minutes: 10,
    coin5Minutes: 60,
    coin10Minutes: 150,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPricing() {
      try {
        const data = await getPricingPackages();

        setPricing({
          coin1Minutes: data.coin1Minutes ?? 10,
          coin5Minutes: data.coin5Minutes ?? 60,
          coin10Minutes: data.coin10Minutes ?? 150,
          isActive: data.isActive ?? true,
        });
      } catch (err) {
        setError(err.message || "Failed to load pricing.");
      } finally {
        setLoading(false);
      }
    }

    loadPricing();
  }, []);

  async function handleInsertCoin(amount) {
    setProcessing(amount);
    setError("");
    setMessage("");
    setSession(null);

    try {
      const result = await createCoinSession(amount);

      setSession(result);
      setMessage(
        `Payment successful. PHP ${result.amount} added ${result.minutes} minutes.`
      );
    } catch (err) {
      setError(err.message || "Failed to create session.");
    } finally {
      setProcessing("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
            <Wifi className="text-white" size={34} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Piso WiFi Portal
          </h1>

          <p className="text-slate-500 mt-2">
            Insert coin to start your internet session.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 flex items-center gap-3">
            <CheckCircle2 size={20} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className="font-semibold text-slate-600">
              Loading packages...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleInsertCoin(1)}
              disabled={processing !== "" || !pricing.isActive}
              className="rounded-2xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-md transition disabled:opacity-60"
            >
              <Coins className="mx-auto text-blue-600 mb-3" size={30} />
              <p className="text-2xl font-bold text-slate-900">PHP 1</p>
              <p className="text-sm text-slate-500 mt-1">
                {pricing.coin1Minutes} mins
              </p>
              <p className="mt-4 text-sm font-semibold text-blue-600">
                {processing === 1 ? "Processing..." : "Insert"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleInsertCoin(5)}
              disabled={processing !== "" || !pricing.isActive}
              className="rounded-2xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-md transition disabled:opacity-60"
            >
              <Coins className="mx-auto text-emerald-600 mb-3" size={30} />
              <p className="text-2xl font-bold text-slate-900">PHP 5</p>
              <p className="text-sm text-slate-500 mt-1">
                {pricing.coin5Minutes} mins
              </p>
              <p className="mt-4 text-sm font-semibold text-blue-600">
                {processing === 5 ? "Processing..." : "Insert"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleInsertCoin(10)}
              disabled={processing !== "" || !pricing.isActive}
              className="rounded-2xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-md transition disabled:opacity-60"
            >
              <Coins className="mx-auto text-purple-600 mb-3" size={30} />
              <p className="text-2xl font-bold text-slate-900">PHP 10</p>
              <p className="text-sm text-slate-500 mt-1">
                {pricing.coin10Minutes} mins
              </p>
              <p className="mt-4 text-sm font-semibold text-blue-600">
                {processing === 10 ? "Processing..." : "Insert"}
              </p>
            </button>
          </div>
        )}

        {!pricing.isActive && (
          <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-medium text-yellow-700">
            Pricing is inactive. Please contact administrator.
          </div>
        )}

        {session && (
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-3">
              Session Created
            </h2>

            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold">Amount:</span> PHP{" "}
                {session.amount}
              </p>

              <p>
                <span className="font-semibold">Time:</span>{" "}
                {session.minutes} mins
              </p>

              <p>
                <span className="font-semibold">IP:</span>{" "}
                {session.ipAddress}
              </p>

              <p>
                <span className="font-semibold">MAC:</span>{" "}
                {session.macAddress}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-8">
          Prototype captive portal. Actual coin detection will come from ESP32.
        </p>
      </div>
    </div>
  );
}

export default CaptivePortal;