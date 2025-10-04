import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
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
        {/* Define your route here */}
        <Route path="/" element={<EventDiscovery />} />
        <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/mentor-discovery" element={<MentorDiscovery />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/event-discovery" element={<EventDiscovery />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
