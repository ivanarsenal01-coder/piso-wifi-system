import { CalendarDays } from "lucide-react";

function DashboardHeader() {
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          Welcome back, Administrator 👋
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
        <CalendarDays className="text-blue-600" size={20} />

        <div>
          <p className="text-xs text-slate-500">
            Today
          </p>

          <p className="font-semibold text-slate-700">
            {today}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;