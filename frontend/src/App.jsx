import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { App as AppPage } from './pages/App';
import { Admin } from './pages/Admin';
import { Waiver } from "./pages/Waiver";
import { WaiverGate } from "./components/WaiverGate";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/app"
            element={
              <WaiverGate>
                <ProtectedRoute>
                  <AppPage />
                </ProtectedRoute>
              </WaiverGate>
            }
          />

          <Route
            path="/admin"
            element={
              <WaiverGate>
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              </WaiverGate>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/waiver" element={<Waiver />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;