import {
  LayoutDashboard,
  Users,
  PhilippinePeso,
  ReceiptText,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Users",
    icon: Users,
    path: "/users",
  },
  {
    name: "Pricing",
    icon: PhilippinePeso,
    path: "/pricing",
  },
  {
    name: "Transactions",
    icon: ReceiptText,
    path: "/transactions",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function Sidebar() {
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F172A] text-white flex flex-col overflow-y-auto">
      <div className="h-24 flex items-center px-8 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight">
          Piso WiFi
        </h1>
      </div>

      <nav className="flex-1 px-5 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={22} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-5 py-6 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={22} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;