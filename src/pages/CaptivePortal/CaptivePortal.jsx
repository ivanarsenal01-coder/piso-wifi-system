import { useEffect, useState } from "react";
import { Coins, Wifi, ShieldCheck, RefreshCcw } from "lucide-react";
import { getPricingPackages } from "../../services/captivePortalService";

function CaptivePortal() {
  const [pricing, setPricing] = useState({
    coin1Minutes: 10,
    coin5Minutes: 60,
    coin10Minutes: 150,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPricing() {
    setLoading(true);
    setError("");

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

  useEffect(() => {
    loadPricing();
  }, []);

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
            Insert coin into the machine to start your internet session.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {!pricing.isActive && (
          <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-medium text-yellow-700">
            Piso WiFi service is currently inactive. Please contact the owner.
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
            <div className="rounded-2xl border border-slate-200 p-5 text-center">
              <Coins className="mx-auto text-blue-600 mb-3" size={30} />
              <p className="text-2xl font-bold text-slate-900">PHP 1</p>
              <p className="text-sm text-slate-500 mt-1">
                {pricing.coin1Minutes} mins
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-center">
              <Coins className="mx-auto text-emerald-600 mb-3" size={30} />
              <p className="text-2xl font-bold text-slate-900">PHP 5</p>
              <p className="text-sm text-slate-500 mt-1">
                {pricing.coin5Minutes} mins
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-center">
              <Coins className="mx-auto text-purple-600 mb-3" size={30} />
              <p className="text-2xl font-bold text-slate-900">PHP 10</p>
              <p className="text-sm text-slate-500 mt-1">
                {pricing.coin10Minutes} mins
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-emerald-600 mt-1" size={24} />

            <div>
              <h2 className="font-bold text-slate-900">
                Business Mode Enabled
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                This portal only displays available packages. Internet time is
                added only when the coin slot or backend server records a real
                coin insert.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadPricing}
          disabled={loading}
          className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-60"
        >
          <RefreshCcw size={20} />
          {loading ? "Refreshing..." : "Refresh Packages"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-8">
          For assistance, contact the Piso WiFi owner.
        </p>
      </div>
    </div>
  );
}

export default CaptivePortal;