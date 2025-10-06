import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AlumniDashboard from './pages/alumni-dashboard';
import Messaging from './pages/messaging';
import MentorDiscovery from './pages/mentor-discovery';
import StudentDashboard from './pages/student-dashboard';
import UserProfile from './pages/user-profile';
import EventDiscovery from './pages/event-discovery';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><EventDiscovery /></ProtectedRoute>} />
        <Route path="/alumni-dashboard" element={<ProtectedRoute><AlumniDashboard /></ProtectedRoute>} />
        <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
        <Route path="/mentor-discovery" element={<ProtectedRoute><MentorDiscovery /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/event-discovery" element={<ProtectedRoute><EventDiscovery /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
