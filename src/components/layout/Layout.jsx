import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <div className="ml-64 min-h-screen flex flex-col">
        <Navbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;