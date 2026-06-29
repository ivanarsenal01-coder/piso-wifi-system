import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Clock,
  Pause,
  Play,
  Search,
  Trash2,
  Users as UsersIcon,
  WifiOff,
  XCircle,
} from "lucide-react";
import {
  deleteUser,
  disconnectUser,
  expireUser,
  pauseUser,
  resumeUser,
  subscribeUsers,
} from "../../services/usersService";

function getDate(value) {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
}

function formatDate(value) {
  const date = getDate(value);

  if (!date) return "No date";

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStoredRemainingSeconds(user) {
  return Number(user.remainingSeconds ?? (user.remainingMinutes || 0) * 60);
}

function getRemainingSeconds(user) {
  if (user.status === "expired" || user.status === "disconnected") {
    return 0;
  }

  if (user.status !== "active") {
    return Math.max(0, getStoredRemainingSeconds(user));
  }

  if (!user.expiresAt) {
    return Math.max(0, getStoredRemainingSeconds(user));
  }

  const expiresDate = getDate(user.expiresAt);

  if (!expiresDate) {
    return Math.max(0, getStoredRemainingSeconds(user));
  }

  const seconds = Math.ceil((expiresDate.getTime() - Date.now()) / 1000);

  return Math.max(0, seconds);
}

function formatRemainingTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs.toString().padStart(2, "0")}s`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getStatusClass(status) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "paused") {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (status === "expired") {
    return "bg-slate-50 text-slate-600 border-slate-200";
  }

  if (status === "disconnected") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

function Users() {
  const [users, setUsers] = useState([]);
  const [tick, setTick] = useState(Date.now());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const expiringRef = useRef(new Set());

  useEffect(() => {
    function handleError(err) {
      setError(err.message || "Failed to load users.");
      setLoading(false);
    }

    const unsubscribe = subscribeUsers((data) => {
      setUsers(data);
      setLoading(false);
    }, handleError);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    users.forEach((user) => {
      const remainingSeconds = getRemainingSeconds(user);

      if (
        user.status === "active" &&
        remainingSeconds <= 0 &&
        !expiringRef.current.has(user.id)
      ) {
        expiringRef.current.add(user.id);

        expireUser(user.id).finally(() => {
          expiringRef.current.delete(user.id);
        });
      }
    });
  }, [users, tick]);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return users;

    return users.filter((user) => {
      return (
        String(user.name || "").toLowerCase().includes(keyword) ||
        String(user.macAddress || "").toLowerCase().includes(keyword) ||
        String(user.ipAddress || "").toLowerCase().includes(keyword) ||
        String(user.deviceName || "").toLowerCase().includes(keyword) ||
        String(user.packageName || "").toLowerCase().includes(keyword) ||
        String(user.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === "active").length;
    const pausedUsers = users.filter((user) => user.status === "paused").length;

    const totalRemainingSeconds = users.reduce((total, user) => {
      return total + getRemainingSeconds(user);
    }, 0);

    return {
      totalUsers,
      activeUsers,
      pausedUsers,
      totalRemainingSeconds,
    };
  }, [users, tick]);

  async function handlePause(userId) {
    setActionLoading(userId);
    setMessage("");
    setError("");

    try {
      await pauseUser(userId);
      setMessage("User session paused.");
    } catch (err) {
      setError(err.message || "Failed to pause user.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleResume(userId) {
    setActionLoading(userId);
    setMessage("");
    setError("");

    try {
      await resumeUser(userId);
      setMessage("User session resumed.");
    } catch (err) {
      setError(err.message || "Failed to resume user.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDisconnect(userId) {
    const confirmed = window.confirm(
      "Disconnect this user? Their remaining time will become 0."
    );

    if (!confirmed) return;

    setActionLoading(userId);
    setMessage("");
    setError("");

    try {
      await disconnectUser(userId);
      setMessage("User disconnected successfully.");
    } catch (err) {
      setError(err.message || "Failed to disconnect user.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete(userId) {
    const confirmed = window.confirm("Delete this user session?");

    if (!confirmed) return;

    setActionLoading(userId);
    setMessage("");
    setError("");

    try {
      await deleteUser(userId);
      setMessage("User deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>

          <p className="text-slate-500 mt-1">
            Monitor active, paused, expired, and disconnected customer sessions.
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <UsersIcon className="text-blue-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Total Users</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {stats.totalUsers}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <UsersIcon className="text-emerald-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Active Users</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {stats.activeUsers}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
            <Pause className="text-yellow-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Paused Users</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {stats.pausedUsers}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
            <Clock className="text-purple-600" size={26} />
          </div>

          <p className="text-sm text-slate-500">Remaining Time</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {formatRemainingTime(stats.totalRemainingSeconds)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              User Sessions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Live countdown and session control.
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
              placeholder="Search users..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10">
            <p className="font-semibold text-slate-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <UsersIcon className="mx-auto text-slate-300" size={42} />

            <p className="mt-4 font-semibold text-slate-700">
              No user sessions found.
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Real sessions will appear when a coin insert is recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Device</th>
                  <th className="px-6 py-4 font-semibold">Package</th>
                  <th className="px-6 py-4 font-semibold">Remaining</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Started</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const remainingSeconds = getRemainingSeconds(user);
                  const isLoading = actionLoading === user.id;

                  return (
                    <tr key={user.id} className="text-sm">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {user.name || "Guest User"}
                        </p>

                        <p className="text-slate-500 mt-1">
                          {user.ipAddress || "No IP"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {user.deviceName || "Unknown Device"}
                        </p>

                        <p className="text-slate-500 mt-1">
                          {user.macAddress || "No MAC"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {user.packageName || "No package"}
                        </p>

                        <p className="text-slate-500 mt-1">
                          PHP {Number(user.amountPaid || 0).toFixed(2)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {formatRemainingTime(remainingSeconds)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                            user.status
                          )}`}
                        >
                          {user.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {user.status === "active" && (
                            <button
                              type="button"
                              onClick={() => handlePause(user.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 font-semibold text-yellow-700 hover:bg-yellow-100 transition disabled:opacity-60"
                            >
                              <Pause size={16} />
                              Pause
                            </button>
                          )}

                          {user.status === "paused" && (
                            <button
                              type="button"
                              onClick={() => handleResume(user.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-60"
                            >
                              <Play size={16} />
                              Resume
                            </button>
                          )}

                          {(user.status === "active" ||
                            user.status === "paused") && (
                            <button
                              type="button"
                              onClick={() => handleDisconnect(user.id)}
                              disabled={isLoading}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-60"
                            >
                              <WifiOff size={16} />
                              Disconnect
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-60"
                          >
                            {user.status === "expired" ||
                            user.status === "disconnected" ? (
                              <Trash2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Users;