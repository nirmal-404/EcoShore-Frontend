import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { registerUser, setAuthToken } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLogin from '@/components/auth/GoogleLogin';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: () => registerUser(email, password),
        onSuccess: (data) => {
            setAuthToken(data.token);
            dispatch(setUser(data));
            navigate('/', { replace: true });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h1>Register (Volunteer)</h1>

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
                    {mutation.isPending ? 'Registering...' : 'Register'}
                </button>
            </form>

            {mutation.isError && (
                <p style={{ color: 'red' }}>{mutation.error.response?.data?.error || 'Registration failed'}</p>
            )}

            <p style={{ margin: '12px 0' }}>or</p>

            <GoogleLogin />

            <p style={{ marginTop: 20 }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
