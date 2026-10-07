import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import { LandingPage } from "./pages/LandingPage"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Dashboard } from "./pages/Dashboard"
import { Customers } from "./pages/Customers"
import { Orders } from "./pages/Orders"
import { Payments } from "./pages/Payments"
import { RiskCases } from "./pages/RiskCases"
import { RecoveryEngine } from "./pages/RecoveryEngine"
import { Analytics } from "./pages/Analytics"
import { Integrations } from "./pages/Integrations"
import { Settings } from "./pages/Settings"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><AppShell><Customers /></AppShell></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><AppShell><Orders /></AppShell></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><AppShell><Payments /></AppShell></ProtectedRoute>} />
          
          <Route path="/risk-cases" element={<ProtectedRoute><AppShell><RiskCases /></AppShell></ProtectedRoute>} />
          <Route path="/recovery" element={<ProtectedRoute><AppShell><RecoveryEngine /></AppShell></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppShell><Analytics /></AppShell></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><AppShell><Integrations /></AppShell></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
