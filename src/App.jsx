import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from '@/components/auth/AuthProvider';
import Layout from '@/layout.jsx';
import PrivateRoute from '@/components/common/PrivateRoute';

import Home from '@/pages/Home';
import Event from '@/pages/Event';
import Beaches from '@/pages/Beaches';
import Contact from '@/pages/Contact';
import Community from '@/pages/Community';
import ChatApp from '@/pages/chat/ChatApp';
import AdminDashboard from '@/pages/admin/Dashboard';
import OraganizerPanel from '@/pages/OrganizerPanel';
import VolunteerDashboard from '@/pages/volunteer/Dashboard';
import CollectorDashboard from '@/pages/collector/Dashboard';
import AgentDashboard from '@/pages/agent/Dashboard';
import UserManagement from '@/pages/UserManagement';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import ProfilePage from '@/pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public layout routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Event />} />
            <Route path="/beaches" element={<Beaches />} />
            <Route path="/community" element={<Community />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/usermanagement" element={<UserManagement />} />

            {/* Protected routes under Layout for all authenticated roles */}
            <Route element={<PrivateRoute allowedRoles={[]} />}>
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Organizer */}
          <Route
            element={<PrivateRoute allowedRoles={['organizer', 'admin']} />}
          >
            <Route path="/organizer" element={<OraganizerPanel />} />
          </Route>

          {/* Volunteer */}
          <Route
            element={
              <PrivateRoute
                allowedRoles={['volunteer', 'organizer', 'admin']}
              />
            }
          >
            <Route path="/volunteer" element={<VolunteerDashboard />} />
          </Route>

          {/* Collector */}
          <Route
            element={<PrivateRoute allowedRoles={['collector', 'admin']} />}
          >
            <Route path="/collector" element={<CollectorDashboard />} />
          </Route>

          {/* Agent */}
          <Route element={<PrivateRoute allowedRoles={['agent', 'admin']} />}>
            <Route path="/agent" element={<AgentDashboard />} />
          </Route>

          {/* Chat */}
          <Route
            element={
              <PrivateRoute
                allowedRoles={[
                  'volunteer',
                  'organizer',
                  'admin',
                  'collector',
                  'agent',
                ]}
              />
            }
          >
            <Route path="/chat" element={<ChatApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
