import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, setAuthToken } from '@/api/authApi';
import { setUser, setLoading, logout } from '@/store/authSlice';

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) return;

    // Always set axios header
    setAuthToken(token);

    // If token exists but user not loaded → fetch
    if (!user) {
      dispatch(setLoading(true));

      getMe()
        .then((data) => {
          dispatch(setUser({ user: data.user, token }));
        })
        .catch(() => {
          dispatch(logout());
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  }, [token, user, dispatch]);

  return children;
}
