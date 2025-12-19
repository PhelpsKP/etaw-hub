import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MarketingLayout } from './layouts/MarketingLayout';
import { AppLayout } from './layouts/AppLayout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { BookOnline } from './pages/BookOnline';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { App as AppPage } from './pages/App';
import { Admin } from './pages/Admin';
import { Book } from './pages/Book';
import { ClientWorkouts } from './pages/ClientWorkouts';
import { ClientIntake } from './pages/ClientIntake';
import { ClientCredits } from './pages/ClientCredits';
import { ClientRewards } from './pages/ClientRewards';
import { ClientMembership } from './pages/ClientMembership';
import { Waiver } from "./pages/Waiver";
import { WaiverGate } from "./components/WaiverGate";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Marketing Routes */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/book" element={<BookOnline />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* App Routes (Protected) */}
          <Route element={<AppLayout />}>
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
              path="/app/book"
              element={
                <WaiverGate>
                  <ProtectedRoute>
                    <Book />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />

            <Route
              path="/app/workouts"
              element={
                <WaiverGate>
                  <ProtectedRoute>
                    <ClientWorkouts />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />

            <Route
              path="/app/intake"
              element={
                <ProtectedRoute>
                  <ClientIntake />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/credits"
              element={
                <WaiverGate>
                  <ProtectedRoute>
                    <ClientCredits />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />

            <Route
              path="/app/rewards"
              element={
                <WaiverGate>
                  <ProtectedRoute>
                    <ClientRewards />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />

            <Route
              path="/app/membership"
              element={
                <WaiverGate>
                  <ProtectedRoute>
                    <ClientMembership />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />

            <Route
              path="/app/admin"
              element={
                <WaiverGate>
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />
          </Route>

          {/* Waiver (standalone, no layout) */}
          <Route path="/waiver" element={<Waiver />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;