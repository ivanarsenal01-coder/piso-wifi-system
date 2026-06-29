import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  UserRoundX,
  Users as UsersIcon,
  Wifi,
} from "lucide-react";
import {
  addTestUser,
  deleteUser,
  disconnectUser,
  expireUser,
  pauseUser,
  resumeUser,
  subscribeUsers,
} from "../../services/usersService";

function formatDate(value) {
  if (!value) return "No date";

  const date = value.toDate ? value.toDate() : new Date(value);

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getRemainingSeconds(user) {
  if (user.status !== "active") {
    return Number(user.remainingSeconds || 0);
  }

  if (!user.expiresAt) {
    return Number(user.remainingSeconds || 0);
  }

  const expiresDate = user.expiresAt.toDate
    ? user.expiresAt.toDate()
    : new Date(user.expiresAt);

  const seconds = Math.ceil((expiresDate.getTime() - Date.now()) / 1000);

  return Math.max(0, seconds);
}

function formatRemaining(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getStatusStyle(status) {
  if (status === "active") {
    return "bg-emerald-100 text-emerald-600";
  }

  if (status === "paused") {
    return "bg-yellow-100 text-yellow-600";
  }

  if (status === "expired") {
    return "bg-slate-100 text-slate-600";
  }

  if (status === "disconnected") {
    return "bg-red-100 text-red-600";
  }

  return "bg-slate-100 text-slate-600";
}

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  const expiringRef = useRef(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeUsers(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load users.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
        String(user.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const activeUsers = users.filter((user) => user.status === "active").length;
  const pausedUsers = users.filter((user) => user.status === "paused").length;

  const totalRemainingSeconds = users.reduce(
    (sum, user) => sum + getRemainingSeconds(user),
    0
  );

  async function handleAddTestUser() {
    setActionLoading("add");
    setError("");

    try {
      await addTestUser();
    } catch (err) {
      setError(err.message || "Failed to add test user.");
    } finally {
      setActionLoading("");
    }
  }

  async function handlePauseResume(user) {
    setActionLoading(user.id);
    setError("");

    try {
      if (user.status === "paused") {
        await resumeUser(user.id);
      } else if (user.status === "active") {
        await pauseUser(user.id);
      }
    } catch (err) {
      setError(err.message || "Failed to update user.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDisconnect(userId) {
    setActionLoading(userId);
    setError("");

    try {
      await disconnectUser(userId);
    } catch (err) {
      setError(err.message || "Failed to disconnect user.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete(userId) {
    setActionLoading(userId);
    setError("");

    try {
      await deleteUser(userId);
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>

          <p className="text-slate-500 mt-1">
            Manage connected users, internet sessions, and remaining time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTestUser}
          disabled={actionLoading === "add"}
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition disabled:opacity-60"
        >
          <Plus size={20} />
          {actionLoading === "add" ? "Adding..." : "Add Test User"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {users.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Users</p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-600">
            {activeUsers}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Paused Users</p>
          <h2 className="mt-3 text-3xl font-bold text-yellow-600">
            {pausedUsers}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Remaining Time</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {formatRemaining(totalRemainingSeconds)}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Connected Users
            </h2>

            <p className="text-sm text-slate-500">
              Latest user sessions from Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 w-full md:w-80">
            <Search size={20} className="text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user..."
              className="w-full outline-none text-sm text-slate-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-[320px] flex items-center justify-center">
            <p className="font-semibold text-slate-600">
              Loading users...
            </p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Device</th>
                  <th className="pb-3 font-semibold">IP Address</th>
                  <th className="pb-3 font-semibold">MAC Address</th>
                  <th className="pb-3 font-semibold">Package</th>
                  <th className="pb-3 font-semibold">Remaining</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Last Seen</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const remainingSeconds = getRemainingSeconds(user);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-50 text-sm text-slate-700"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <UsersIcon className="text-blue-600" size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name || "Guest User"}
                            </p>

                            <p className="text-xs text-slate-500">
                              PHP {Number(user.amountPaid || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        {user.deviceName || "Unknown"}
                      </td>

                      <td className="py-4">
                        {user.ipAddress || "N/A"}
                      </td>

                      <td className="py-4">
                        {user.macAddress || "N/A"}
                      </td>

                      <td className="py-4">
                        {user.packageName || "No package"}
                      </td>

                      <td className="py-4 font-semibold">
                        {formatRemaining(remainingSeconds)}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                            user.status
                          )}`}
                        >
                          {user.status || "unknown"}
                        </span>
                      </td>

                      <td className="py-4">
                        {formatDate(user.lastSeen)}
                      </td>

                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(user.status === "active" ||
                            user.status === "paused") && (
                            <button
                              type="button"
                              onClick={() => handlePauseResume(user)}
                              disabled={actionLoading === user.id}
                              className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
                              title={
                                user.status === "paused" ? "Resume" : "Pause"
                              }
                            >
                              {user.status === "paused" ? (
                                <Play size={17} />
                              ) : (
                                <Pause size={17} />
                              )}
                            </button>
                          )}

                          {(user.status === "active" ||
                            user.status === "paused") && (
                            <button
                              type="button"
                              onClick={() => handleDisconnect(user.id)}
                              disabled={actionLoading === user.id}
                              className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition"
                              title="Disconnect"
                            >
                              <UserRoundX size={17} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id}
                            className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[320px] flex flex-col items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Wifi className="text-blue-600" size={28} />
            </div>

            <p className="text-lg font-semibold text-slate-700">
              No connected users yet
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Users will appear here once devices connect to the Piso WiFi.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Users;