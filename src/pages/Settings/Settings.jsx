import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Cpu,
  Router as RouterIcon,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  subscribeSettings,
  subscribeRouter,
  subscribeEsp32,
  updateSettings,
  updateRouter,
  updateEsp32,
} from "../../services/settingsService";
import { resetTestData } from "../../services/resetService";

function Settings() {
  const [settings, setSettings] = useState({
    appName: "Piso WiFi Management System",
    currency: "PHP",
    timezone: "Asia/Manila",
    maintenanceMode: false,
    allowRegistration: false,
  });

  const [router, setRouter] = useState({
    name: "Main MikroTik",
    ipAddress: "192.168.88.1",
    status: "offline",
    activeClients: 0,
  });

  const [esp32, setEsp32] = useState({
    name: "ESP32 Coin Controller",
    type: "esp32",
    status: "offline",
    lastCoin: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let loadedCount = 0;

    function markLoaded() {
      loadedCount += 1;

      if (loadedCount >= 3) {
        setLoading(false);
      }
    }

    function handleError(err) {
      setError(err.message || "Failed to load settings.");
      setLoading(false);
    }

    const unsubSettings = subscribeSettings((data) => {
      if (data) {
        setSettings({
          appName: data.appName ?? "Piso WiFi Management System",
          currency: data.currency ?? "PHP",
          timezone: data.timezone ?? "Asia/Manila",
          maintenanceMode: data.maintenanceMode ?? false,
          allowRegistration: data.allowRegistration ?? false,
        });
      }

      markLoaded();
    }, handleError);

    const unsubRouter = subscribeRouter((data) => {
      if (data) {
        setRouter({
          name: data.name ?? "Main MikroTik",
          ipAddress: data.ipAddress ?? "192.168.88.1",
          status: data.status ?? "offline",
          activeClients: data.activeClients ?? 0,
        });
      }

      markLoaded();
    }, handleError);

    const unsubEsp32 = subscribeEsp32((data) => {
      if (data) {
        setEsp32({
          name: data.name ?? "ESP32 Coin Controller",
          type: data.type ?? "esp32",
          status: data.status ?? "offline",
          lastCoin: data.lastCoin ?? 0,
        });
      }

      markLoaded();
    }, handleError);

    return () => {
      unsubSettings();
      unsubRouter();
      unsubEsp32();
    };
  }, []);

  function handleSettingsChange(event) {
    const { name, value, type, checked } = event.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleRouterChange(event) {
    const { name, value } = event.target;

    setRouter((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEsp32Change(event) {
    const { name, value } = event.target;

    setEsp32((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveAppSettings(event) {
    event.preventDefault();

    setSaving("settings");
    setMessage("");
    setError("");

    try {
      await updateSettings(settings);
      setMessage("App settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save app settings.");
    } finally {
      setSaving("");
    }
  }

  async function saveRouter(event) {
    event.preventDefault();

    setSaving("router");
    setMessage("");
    setError("");

    try {
      await updateRouter(router);
      setMessage("Router settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save router settings.");
    } finally {
      setSaving("");
    }
  }

  async function saveEsp32(event) {
    event.preventDefault();

    setSaving("esp32");
    setMessage("");
    setError("");

    try {
      await updateEsp32(esp32);
      setMessage("ESP32 settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save ESP32 settings.");
    } finally {
      setSaving("");
    }
  }

  async function handleResetTestData() {
    const confirmed = window.confirm(
      "Are you sure you want to reset test data? This will delete all users and transactions."
    );

    if (!confirmed) return;

    setResetting(true);
    setMessage("");
    setError("");

    try {
      await resetTestData();
      setMessage("Test data reset successfully.");
    } catch (err) {
      setError(err.message || "Failed to reset test data.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

        <p className="text-slate-500 mt-1">
          Configure system preferences, MikroTik router, and ESP32 controller.
        </p>
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm">
          <p className="font-semibold text-slate-600">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <form
            onSubmit={saveAppSettings}
            className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <SettingsIcon className="text-blue-600" size={26} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  App Settings
                </h2>

                <p className="text-sm text-slate-500">
                  Main configuration of the admin system.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  App Name
                </label>

                <input
                  name="appName"
                  value={settings.appName}
                  onChange={handleSettingsChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Currency
                </label>

                <input
                  name="currency"
                  value={settings.currency}
                  onChange={handleSettingsChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Timezone
                </label>

                <input
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleSettingsChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleSettingsChange}
                  className="h-5 w-5"
                />

                <span className="font-medium text-slate-700">
                  Maintenance Mode
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={handleSettingsChange}
                  className="h-5 w-5"
                />

                <span className="font-medium text-slate-700">
                  Allow Registration
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving === "settings"}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
            >
              <Save size={20} />
              {saving === "settings" ? "Saving..." : "Save App Settings"}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="text-emerald-600" size={26} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  System Status
                </h2>

                <p className="text-sm text-slate-500">
                  Current configuration status.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Maintenance</p>
                <p className="text-lg font-bold text-slate-900">
                  {settings.maintenanceMode ? "Enabled" : "Disabled"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Router</p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {router.status}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">ESP32</p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {esp32.status}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={saveRouter}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <RouterIcon className="text-orange-600" size={26} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  MikroTik Router
                </h2>

                <p className="text-sm text-slate-500">
                  Router network settings.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Router Name
                </label>

                <input
                  name="name"
                  value={router.name}
                  onChange={handleRouterChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  IP Address
                </label>

                <input
                  name="ipAddress"
                  value={router.ipAddress}
                  onChange={handleRouterChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={router.status}
                  onChange={handleRouterChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving === "router"}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
            >
              <Save size={20} />
              {saving === "router" ? "Saving..." : "Save Router"}
            </button>
          </form>

          <form
            onSubmit={saveEsp32}
            className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Cpu className="text-purple-600" size={26} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  ESP32 Controller
                </h2>

                <p className="text-sm text-slate-500">
                  Coin slot controller settings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Device Name
                </label>

                <input
                  name="name"
                  value={esp32.name}
                  onChange={handleEsp32Change}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type
                </label>

                <input
                  name="type"
                  value={esp32.type}
                  onChange={handleEsp32Change}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={esp32.status}
                  onChange={handleEsp32Change}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving === "esp32"}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
            >
              <Save size={20} />
              {saving === "esp32" ? "Saving..." : "Save ESP32"}
            </button>
          </form>

          <div className="xl:col-span-3 bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <h2 className="text-xl font-bold text-red-600">
                  Reset Test Data
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Clear all test users and transactions, then reset dashboard
                  income and coins to zero.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetTestData}
                disabled={resetting}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition disabled:opacity-60"
              >
                <Trash2 size={20} />
                {resetting ? "Resetting..." : "Reset Test Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Settings;