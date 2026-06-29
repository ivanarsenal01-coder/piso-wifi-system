import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function EarningsChart({ data = [] }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Earnings Overview
          </h2>
          <p className="text-sm text-slate-500">
            Weekly income performance
          </p>
        </div>

        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View Report
        </button>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#earningsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[320px] flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <p className="text-lg font-semibold text-slate-700">
            No earnings data yet
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Data will appear here once Firebase records transactions.
          </p>
        </div>
      )}
    </div>
  );
}

export default EarningsChart;