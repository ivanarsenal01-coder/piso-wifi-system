import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Clock, Coins, PhilippinePeso, Save } from "lucide-react";
import { subscribePricing, updatePricing } from "../../services/pricingService";

function Pricing() {
  const [form, setForm] = useState({
    coin1Minutes: 10,
    coin5Minutes: 60,
    coin10Minutes: 150,
    pauseTimeEnabled: true,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribePricing(
      (data) => {
        if (data) {
          setForm({
            coin1Minutes: data.coin1Minutes ?? 10,
            coin5Minutes: data.coin5Minutes ?? 60,
            coin10Minutes: data.coin10Minutes ?? 150,
            pauseTimeEnabled: data.pauseTimeEnabled ?? true,
            isActive: data.isActive ?? true,
          });
        }

        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load pricing.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updatePricing(form);
      setMessage("Pricing updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update pricing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pricing</h1>

          <p className="text-slate-500 mt-1">
            Manage coin rates and internet time packages.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
          <PhilippinePeso className="text-emerald-600" size={24} />

          <div>
            <p className="text-xs text-slate-500">Pricing Status</p>
            <p className="font-semibold text-slate-800">
              {form.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Coins className="text-emerald-600" size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Coin Rates
              </h2>

              <p className="text-sm text-slate-500">
                Set how many minutes each coin value gives.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="font-semibold text-slate-600">
                Loading pricing...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PHP 1 Minutes
                  </label>

                  <input
                    type="number"
                    name="coin1Minutes"
                    value={form.coin1Minutes}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PHP 5 Minutes
                  </label>

                  <input
                    type="number"
                    name="coin5Minutes"
                    value={form.coin5Minutes}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PHP 10 Minutes
                  </label>

                  <input
                    type="number"
                    name="coin10Minutes"
                    value={form.coin10Minutes}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="pauseTimeEnabled"
                    checked={form.pauseTimeEnabled}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />

                  <span className="font-medium text-slate-700">
                    Enable pause time
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />

                  <span className="font-medium text-slate-700">
                    Pricing is active
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
              >
                <Save size={20} />
                {saving ? "Saving..." : "Save Pricing"}
              </button>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Clock className="text-blue-600" size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Preview</h2>

              <p className="text-sm text-slate-500">
                Current time packages.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">PHP 1 Coin</p>
              <p className="text-2xl font-bold text-slate-900">
                {form.coin1Minutes} mins
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">PHP 5 Coin</p>
              <p className="text-2xl font-bold text-slate-900">
                {form.coin5Minutes} mins
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">PHP 10 Coin</p>
              <p className="text-2xl font-bold text-slate-900">
                {form.coin10Minutes} mins
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Pause Time</p>
              <p className="text-xl font-bold text-slate-900">
                {form.pauseTimeEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}

export default Pricing;