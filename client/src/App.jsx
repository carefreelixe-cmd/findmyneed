import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchProviders from "./pages/customer/SearchProviders";
import ProviderDetails from "./pages/customer/ProviderDetails";

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProviderDashboard = lazy(() => import("./pages/provider/Dashboard"));
const CustomerDashboard = lazy(() => import("./pages/customer/Dashboard"));

const PageLoader = () => (
  <div className="grid min-h-screen place-items-center bg-[#f5f4ed]">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#173c2b]/20 border-t-[#173c2b]" />
      <p className="mt-4 font-bold text-[#526057]">Loading your workspace…</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      <Route path="/search" element={<SearchProviders />} />
      <Route path="/providers/:id" element={<ProviderDetails />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Provider Routes */}
      <Route
        path="/provider/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />

      {/* Customer Routes */}
      <Route
        path="/customer/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
