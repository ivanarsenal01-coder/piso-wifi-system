function StatusCard({
  title,
  description,
  status = "Offline",
  statusColor = "red",
}) {
  const statusStyles = {
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="font-semibold text-slate-900">{description}</p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          statusStyles[statusColor] || statusStyles.red
        }`}
      >
        {status}
      </span>
    </div>
  );
}

export default StatusCard;