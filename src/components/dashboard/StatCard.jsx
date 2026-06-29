import { TrendingUp } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  trend = "0%",
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-4 text-3xl font-bold text-slate-900">
            {value}
          </h2>
        </div>

        <div
          className={`h-14 w-14 rounded-2xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className={iconColor} size={28} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1 font-semibold text-emerald-600">
          <TrendingUp size={16} />
          {trend}
        </span>

        <span className="text-slate-500">
          Up from yesterday
        </span>
      </div>
    </div>
  );
}

export default StatCard;