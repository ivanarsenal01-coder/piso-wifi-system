import { ReceiptText } from "lucide-react";

function RecentTransactions({ transactions = [] }) {
  const hasTransactions =
    Array.isArray(transactions) && transactions.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Recent Transactions
          </h2>
          <p className="text-sm text-slate-500">
            Latest coin payments and session records
          </p>
        </div>

        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      {hasTransactions ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-sm text-slate-500">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Time Added</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 text-sm text-slate-700"
                >
                  <td className="py-4 font-medium">{item.user}</td>
                  <td className="py-4">{item.amount}</td>
                  <td className="py-4">{item.timeAdded}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[220px] flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <ReceiptText className="text-blue-600" size={28} />
          </div>

          <p className="text-lg font-semibold text-slate-700">
            No transactions yet
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Transactions will appear here once users insert coins.
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentTransactions;