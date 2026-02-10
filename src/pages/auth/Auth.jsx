import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginUser, setAuthToken, getMe } from '@/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
      localStorage.setItem('token', token);
      getMe()
        .then((user) => {
          dispatch(setUser(user));
          redirectByRole(user.role);
        })
        .catch((error) => {
          console.error('Invalid Google token', error);
        });
    }
  }, [searchParams]);

  // 🚫 Prevent logged-in users from seeing login
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      dispatch(setUser(data.user));
      redirectByRole(data.user.role);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
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
        <button type="submit">Login</button>
      </form>

      <p style={{ margin: '12px 0' }}>or</p>

      <GoogleLogin />
    </div>
  );
}
