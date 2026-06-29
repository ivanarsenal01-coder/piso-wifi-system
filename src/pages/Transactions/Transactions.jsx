import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  CheckCircle2,
  Coins,
  PhilippinePeso,
  ReceiptText,
  Search,
} from "lucide-react";
import { subscribeTransactions } from "../../services/transactionsService";

function getDate(value) {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
}

function formatDate(value) {
  const date = getDate(value);

  if (!date) return "Processing...";

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusClass(status) {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "pending") {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleError(err) {
      setError(err.message || "Failed to load transactions.");
      setLoading(false);
    }

    const unsubscribe = subscribeTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    }, handleError);

    return () => unsubscribe();
  }, []);

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return transactions;

    return transactions.filter((transaction) => {
      return (
        String(transaction.user || "").toLowerCase().includes(keyword) ||
        String(transaction.macAddress || "").toLowerCase().includes(keyword) ||
        String(transaction.source || "").toLowerCase().includes(keyword) ||
        String(transaction.status || "").toLowerCase().includes(keyword) ||
        String(transaction.amount || "").toLowerCase().includes(keyword)
      );
    });
  }, [transactions, search]);

  const stats = useMemo(() => {
    const totalIncome = transactions.reduce((total, transaction) => {
      return total + Number(transaction.amount || 0);
    }, 0);

    const totalCoins = transactions.reduce((total, transaction) => {
      return total + Number(transaction.coinsInserted || 0);
    }, 0);

    const completedTransactions = transactions.filter(
      (transaction) => transaction.status === "completed"
    ).length;

    return {
      totalTransactions: transactions.length,
      completedTransactions,
      totalIncome,
      totalCoins,
    };
  }, [transactions]);

  return (
    <Layout>
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Transactions
          </h1>

          <p className="text-slate-500 mt-1">
            View coin inserts, payments, and internet time records.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <ReceiptText className="text-blue-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Total Transactions</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {stats.totalTransactions}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="text-emerald-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Completed</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {stats.completedTransactions}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
            <PhilippinePeso className="text-purple-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Total Income</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            PHP {stats.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
            <Coins className="text-orange-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Coins Inserted</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {stats.totalCoins}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Transaction History
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Latest payment records from backend server and coin inserts.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10">
            <p className="font-semibold text-slate-600">
              Loading transactions...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center">
            <ReceiptText className="mx-auto text-slate-300" size={42} />

            <p className="mt-4 font-semibold text-slate-700">
              No transactions found.
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Coin insert records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Time Added</th>
                  <th className="px-6 py-4 font-semibold">Coins</th>
                  <th className="px-6 py-4 font-semibold">Source</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {transaction.user || "Guest User"}
                      </p>

                      <p className="text-slate-500 mt-1">
                        {transaction.macAddress || "No MAC"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        PHP {Number(transaction.amount || 0).toFixed(2)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {transaction.timeAdded ?? 0} mins
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {transaction.coinsInserted ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        {transaction.source || "unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status || "pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Transactions;