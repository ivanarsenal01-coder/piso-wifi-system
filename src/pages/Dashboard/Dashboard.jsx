import Layout from "../../components/layout/Layout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import StatusCard from "../../components/dashboard/StatusCard";
import EarningsChart from "../../components/charts/EarningsChart";
import RecentTransactions from "../../components/tables/RecentTransactions";
import { useDashboard } from "../../hooks/useDashboard";

import {
  PhilippinePeso,
  Users,
  Wifi,
  Coins,
} from "lucide-react";

function Dashboard() {
  const {
    summary,
    router,
    esp32,
    recentTransactions,
    earningsData,
    loading,
    error,
  } = useDashboard();

  const routerOnline = router.status === "online";
  const esp32Online = esp32.status === "online";

  const computedOnlineDevices =
    (routerOnline ? 1 : 0) + (esp32Online ? 1 : 0);

  return (
    <Layout>
      <DashboardHeader />

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Today's Income"
          value={
            loading
              ? "Loading..."
              : `PHP ${Number(summary.todayIncome).toFixed(2)}`
          }
          icon={PhilippinePeso}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          trend="0%"
        />

        <StatCard
          title="Active Users"
          value={loading ? "..." : summary.activeUsers}
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend="0%"
        />

        <StatCard
          title="Online Devices"
          value={loading ? "..." : computedOnlineDevices}
          icon={Wifi}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          trend="0%"
        />

        <StatCard
          title="Coins Today"
          value={loading ? "..." : summary.coinsToday}
          icon={Coins}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          trend="0%"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <EarningsChart data={earningsData} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            System Status
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Router, ESP32, and Firebase connection monitoring.
          </p>

          <div className="mt-6 space-y-4">
            <StatusCard
              title="MikroTik Router"
              description={routerOnline ? "Connected" : "Not Connected"}
              status={routerOnline ? "Online" : "Offline"}
              statusColor={routerOnline ? "green" : "red"}
            />

            <StatusCard
              title="ESP32 Controller"
              description={esp32Online ? "Connected" : "Not Connected"}
              status={esp32Online ? "Online" : "Offline"}
              statusColor={esp32Online ? "green" : "red"}
            />

            <StatusCard
              title="Firebase"
              description={error ? "Permission Error" : "Connected"}
              status={error ? "Error" : "Online"}
              statusColor={error ? "red" : "green"}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </Layout>
  );
}

export default Dashboard;