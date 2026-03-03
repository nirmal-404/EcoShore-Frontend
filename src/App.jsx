import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '@/pages/auth/Auth.jsx';
import Register from '@/pages/auth/Register.jsx';
import AdminDashboard from '@/pages/admin/Dashboard.jsx';
import PrivateRoute from '@/components/common/PrivateRoute.jsx';
import './App.css';

import Home from '@/pages/Home.jsx';
import Event from '@/pages/Event.jsx';
import Beaches from '@/pages/Beaches.jsx';
import Contact from '@/pages/Contact.jsx';
import Community from '@/pages/Community.jsx';
import ChatApp from '@/pages/chat/ChatApp.jsx';
import OraganizerPanel from '@/pages/OrganizerPanel.jsx';
import VolunteerDashboard from '@/pages/volunteer/Dashboard.jsx';
import CollectorDashboard from '@/pages/collector/Dashboard.jsx';
import Navbar from '@/components/common/Navbar.jsx';
import TestPanel from '@/pages/TestPanel.jsx';

import { useDispatch, useSelector } from 'react-redux';
import { getMe, setAuthToken } from '@/api/authApi';
import { setUser, setLoading } from '@/store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (token && !user) {
      setAuthToken(token);
      dispatch(setLoading(true));
      getMe()
        .then((data) => {
          dispatch(setUser(data));
        })
        .catch(() => {
          dispatch(setUser({ user: null, token: null }));
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  }, [token, user, dispatch]);

  return (
    <BrowserRouter>
      <div className="h-screen overflow-hidden flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto min-h-0">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Event />} />
            <Route path="/beaches" element={<Beaches />} />
            <Route path="/community" element={<Community />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-panel" element={<TestPanel />} />

            {/* Protected */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/organizer"
              element={
                <PrivateRoute allowedRoles={['organizer', 'admin']}>
                  <OraganizerPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer"
              element={
                <PrivateRoute allowedRoles={['volunteer', 'organizer', 'admin']}>
                  <VolunteerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/collector"
              element={
                <PrivateRoute allowedRoles={['collector', 'admin']}>
                  <CollectorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute allowedRoles={['volunteer', 'organizer', 'admin', 'collector']}>
                  <ChatApp />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
