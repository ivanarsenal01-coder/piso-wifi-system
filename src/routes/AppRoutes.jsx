import { Component, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const Users = lazy(() => import("../pages/Users/Users"));
const Pricing = lazy(() => import("../pages/Pricing/Pricing"));
const Transactions = lazy(() => import("../pages/Transactions/Transactions"));
const Settings = lazy(() => import("../pages/Settings/Settings"));
const CaptivePortal = lazy(() => import("../pages/CaptivePortal/CaptivePortal"));

function PageLoading() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-slate-200">
        <p className="text-slate-700 font-semibold">Loading page...</p>
      </div>
    </div>
  );
}

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Page failed to load.",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-red-200 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-red-600">
              Page Error
            </h1>

            <p className="mt-3 text-slate-600">
              May mali sa page file na binuksan mo. Hindi na magpuputi buong app.
            </p>

            <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-mono text-red-700 break-words">
                {this.state.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = "/dashboard"}
              className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <RouteErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          {children}
        </Suspense>
      </RouteErrorBoundary>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedPage>
              <Users />
            </ProtectedPage>
          }
        />

        <Route
          path="/pricing"
          element={
            <ProtectedPage>
              <Pricing />
            </ProtectedPage>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedPage>
              <Transactions />
            </ProtectedPage>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedPage>
              <Settings />
            </ProtectedPage>
          }
        />

        <Route
          path="/captive-portal"
          element={
            <ProtectedPage>
              <CaptivePortal />
            </ProtectedPage>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;