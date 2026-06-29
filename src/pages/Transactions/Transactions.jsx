import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  addTestTransaction,
  subscribeTransactions,
} from "../../services/transactionsService";

function formatDate(value) {
  if (!value) return "No date";

  const date = value.toDate ? value.toDate() : new Date(value);

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeTransactions(
      (data) => {
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load transactions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return transactions;

    return transactions.filter((item) => {
      return (
        String(item.user || "").toLowerCase().includes(keyword) ||
        String(item.macAddress || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword) ||
        String(item.amount || "").toLowerCase().includes(keyword)
      );
    });
  }, [transactions, search]);

  const totalAmount = transactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalCoins = transactions.reduce(
    (sum, item) => sum + Number(item.coinsInserted || 0),
    0
  );

  async function handleAddTestTransaction() {
    setAdding(true);
    setError("");

    try {
      await addTestTransaction();
    } catch (err) {
      setError(err.message || "Failed to add test transaction.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Transactions
          </h1>

          <p className="text-slate-500 mt-1">
            View coin payments and session transaction records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTestTransaction}
          disabled={adding}
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
        >
          <Plus size={20} />
          {adding ? "Adding..." : "Add Test Transaction"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Income</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            PHP {totalAmount.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Coins</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {totalCoins}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Records</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {transactions.length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Transaction History
            </h2>

            <p className="text-sm text-slate-500">
              Latest transaction records from Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 w-full md:w-80">
            <Search size={20} className="text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transaction..."
              className="w-full outline-none text-sm text-slate-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="font-semibold text-slate-600">
              Loading transactions...
            </p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">MAC Address</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Coins</th>
                  <th className="pb-3 font-semibold">Time Added</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 text-sm text-slate-700"
                  >
                    <td className="py-4 font-semibold text-slate-900">
                      {item.user || "Guest User"}
                    </td>

                    <td className="py-4">
                      {item.macAddress || "N/A"}
                    </td>

                    <td className="py-4">
                      PHP {Number(item.amount || 0).toFixed(2)}
                    </td>

                    <td className="py-4">
                      {item.coinsInserted ?? 0}
                    </td>

                    <td className="py-4">
                      {item.timeAdded ?? 0} mins
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "completed"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {item.status || "pending"}
                      </span>
                    </td>

                    <td className="py-4">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <ReceiptText className="text-blue-600" size={28} />
            </div>

            <p className="text-lg font-semibold text-slate-700">
              No transactions yet
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Coin payments will appear here once users insert coins.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Transactions;