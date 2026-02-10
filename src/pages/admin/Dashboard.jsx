import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice.js';
import { setAuthToken } from '@/api/authApi.js';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    setAuthToken(null);
    dispatch(logout());
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome {user?.name || 'User'}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
