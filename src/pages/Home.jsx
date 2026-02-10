import React from 'react';
import { useSelector } from 'react-redux';

export default function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1>Public System Interface</h1>

      {/* Extra tab for organizers */}
      {user?.role === 'organizer' && <button>Organizer Panel</button>}

      {/* Admin-only button */}
      {user?.role === 'admin' && <button>Admin Dashboard</button>}

      {/* Volunteers see extra operations */}
      {user?.role === 'volunteer' && <button>Volunteer Operations</button>}
    </div>
  );
}
