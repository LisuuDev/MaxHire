import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Browse from "./pages/Browse";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Offer from "./pages/Offer";
import Recover from "./pages/Recover";
import CreateOffer from "./pages/CreateOffer";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import AdminPanel from "./pages/AdminPanel";

const App = () => {
  const { user } = useAuth();

  return (
    <div className="relative w-full selection:bg-purple-100">
      <div className="fixed top-0 -z-10 h-full w-full bg-white ">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-50 blur-[80px]"></div>
      </div>

      <Toaster />
      <ScrollToTop />
      <Navbar />

      <main className="min-h-screen">
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <Browse />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/contact" 
            element={<Contact />} 
          />
          <Route 
            path="/admin" 
            element={<AdminPanel />} 
          />
          <Route
            path="/offer/:id"
            element={
              <ProtectedRoute>
                <Offer />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/recover"
            element={user ? <Navigate to="/" replace /> : <Recover />}
          />
          <Route
            path="/recover/:token"
            element={user ? <Navigate to="/" replace /> : <Recover />}
          />
          <Route 
            path="/createOffer" 
            element={
              <ProtectedRoute>
                <CreateOffer />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/editOffer/:id" 
            element={
              <ProtectedRoute>
                <CreateOffer />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;