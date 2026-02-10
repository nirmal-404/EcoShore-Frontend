import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginUser, setAuthToken, getMe } from '@/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import GoogleLogin from '@/components/auth/GoogleLogin';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth);

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'organizer') navigate('/organizer', { replace: true });
    else if (role === 'volunteer') navigate('/volunteer', { replace: true });
    else navigate('/', { replace: true });
  };

  // 🔥 GOOGLE CALLBACK HANDLER
  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setAuthToken(token);
      getMe()
        .then((data) => {
          dispatch(setUser(data));
          // Note: setUser will handle the cookie via authSlice
        })
        .catch((error) => {
          console.error('Invalid Google token', error);
        });
    }
  }, [searchParams, dispatch]);

  // 🚫 Prevent logged-in users from seeing login
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      dispatch(setUser(data));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  const handleQuickLogin = (email, password) => {
    mutation.mutate({ email, password });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <br />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {mutation.isError && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {mutation.error.response?.data?.error || 'Login failed'}
        </p>
      )}

      <div style={{ marginTop: 30, padding: 20, border: '1px solid #ccc', display: 'inline-block' }}>
        <h3>Quick Login (Testing)</h3>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => handleQuickLogin('admin@gmail.com', 'admin')}>Admin</button>
          <button onClick={() => handleQuickLogin('organizer@gmail.com', 'organizer')}>
            Organizer
          </button>
          <button onClick={() => handleQuickLogin('volunteer@gmail.com', 'volunteer')}>
            Volunteer
          </button>
        </div>
      </div>

      <p style={{ margin: '12px 0' }}>or</p>

      <GoogleLogin />

      <p style={{ marginTop: 20 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
