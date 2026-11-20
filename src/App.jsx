import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import NavBar from "./components/NavBar/NavBar";
import Welcome from "./components/Info/Welcome/Welcome";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import EmailVerified from "./components/auth/EmailVerified";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestOnlyRoute from "./components/auth/GuestOnlyRoute";
import Footer from "./components/Footer/Footer";
import "./index.css";

const Info = lazy(() => import("./components/Info/InfoPage/InfoPage"));
const RegWelcome = lazy(() => import("./components/Info/RegWelcome/RegWelcome"));
const FamilyChat = lazy(() => import("./components/FamilyChat/FamilyChat"));
const Calendar = lazy(() => import("./components/Calendar/Calendar"));
const Terms = lazy(() => import("./components/Info/Terms/Terms"));
const Profile = lazy(() => import("./components/auth/Profile"));
const ChristmasLottery = lazy(() => import("./components/Christmas/ChristmasLottery"));
const MyEvents = lazy(() => import("./components/MyEvents/MyEvents"));
const Albums = lazy(() => import("./components/Albums/Albums"));
const FamilyPearls = lazy(() => import("./components/FamilyPearls/FamilyPearls"));
const Tutorial = lazy(() => import("./components/Info/Tutorial/Tutorial"));

// App root and routing
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-beige via-off-white to-[var(--bg-2)] flex flex-col">
      {user && <NavBar />}
      <div className={user ? "flex flex-1" : "flex-1"}>
        <main className={`flex-1 w-full ${user ? "lg:ml-72" : ""}`}>
          <Suspense
            fallback={
              <div className="section-shell py-10">
                <div className="card">Ielādē lapu...</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={user ? <RegWelcome /> : <Welcome />} />
              <Route
                path="/login"
                element={
                  <GuestOnlyRoute>
                    <Login />
                  </GuestOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestOnlyRoute>
                    <Register />
                  </GuestOnlyRoute>
                }
              />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route
                path="/RegWelcome"
                element={
                  <ProtectedRoute>
                    <RegWelcome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info"
                element={
                  <ProtectedRoute>
                    <Info />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/christmas"
                element={
                  <ProtectedRoute>
                    <ChristmasLottery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums"
                element={
                  <ProtectedRoute>
                    <Albums />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family-pearls"
                element={
                  <ProtectedRoute>
                    <FamilyPearls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family-chat"
                element={
                  <ProtectedRoute>
                    <FamilyChat />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
      {user && <div className="lg:ml-72"><Footer /></div>}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
