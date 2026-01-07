import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { RoleRedirect } from './components/RoleRedirect';
import { MarketingLayout } from './layouts/MarketingLayout';
import { AppLayout } from './layouts/AppLayout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { BookOnline } from './pages/BookOnline';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Admin } from './pages/Admin';
import { Book } from './pages/Book';
import { ClientWorkouts } from './pages/ClientWorkouts';
import { ClientIntake } from './pages/ClientIntake';
import { ClientCredits } from './pages/ClientCredits';
import { ClientRewards } from './pages/ClientRewards';
import { ClientMembership } from './pages/ClientMembership';
import { Waiver } from "./pages/Waiver";
import { WaiverGate } from "./components/WaiverGate";
import { OnboardingGate } from "./components/OnboardingGate";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/book"
              element={
                <OnboardingGate>
                  <ProtectedRoute>
                    <Book />
                  </ProtectedRoute>
                </OnboardingGate>
              }
            />

            <Route
              path="/app/workouts"
              element={
                <OnboardingGate>
                  <ProtectedRoute>
                    <ClientWorkouts />
                  </ProtectedRoute>
                </OnboardingGate>
              }
            />

            {/* Intake needs WaiverGate but NOT OnboardingGate since it's part of onboarding */}
            <Route
              path="/app/intake"
              element={
                <WaiverGate>
                  <ProtectedRoute>
                    <ClientIntake />
                  </ProtectedRoute>
                </WaiverGate>
              }
            />

            <Route
              path="/app/credits"
              element={
                <OnboardingGate>
                  <ProtectedRoute>
                    <ClientCredits />
                  </ProtectedRoute>
                </OnboardingGate>
              }
            />

            <Route
              path="/app/rewards"
              element={
                <OnboardingGate>
                  <ProtectedRoute>
                    <ClientRewards />
                  </ProtectedRoute>
                </OnboardingGate>
              }
            />

            <Route
              path="/app/membership"
              element={
                <OnboardingGate>
                  <ProtectedRoute>
                    <ClientMembership />
                  </ProtectedRoute>
                </OnboardingGate>
              }
            />

            <Route
              path="/app/admin"
              element={
                <OnboardingGate>
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                </OnboardingGate>
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