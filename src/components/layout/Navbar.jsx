import { Bell, Search, UserRound } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-30 h-20 bg-slate-100/80 backdrop-blur-xl border-b border-slate-200">
      <div className="h-full px-6 flex items-center justify-end gap-4">
        <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm w-80">
          <Search size={20} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>

        <button className="relative h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:shadow-md transition">
          <Bell size={21} className="text-slate-600" />

          <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <UserRound size={22} className="text-blue-600" />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              Administrator
            </p>

            <p className="text-xs text-slate-500">
              Online
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;