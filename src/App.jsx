import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '@/pages/auth/Auth.jsx';
import AdminDashboard from '@/pages/admin/Dashboard.jsx';
import PrivateRoute from '@/components/common/PrivateRoute.jsx';
import './App.css';

import Home from '@/pages/Home.jsx';
import Event from '@/pages/Event.jsx';
import OraganizerPanel from '@/pages/OrganizerPanel.jsx';
import Navbar from '@/components/common/Navbar.jsx';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Event />} />
        <Route path="/login" element={<Login />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
