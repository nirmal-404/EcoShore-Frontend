import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser, setAuthToken, getMe } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';

/**
 * useLogin — React Query mutation for authenticating a user.
 * Mirrors the same pattern as useAddBeach from hooks/beaches.js.
 * On success, sets the auth token and stores the user in Redux.
 */
export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      dispatch(setUser(data));
    },
  });
};

/**
 * useSignup — React Query mutation for registering a new volunteer.
 * On success, sets the auth token, stores the user in Redux, and
 * redirects to the home page.
 */
export const useSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData) => registerUser(formData),
    onSuccess: (data) => {
      setAuthToken(data.token);
      dispatch(setUser(data));
      navigate('/', { replace: true });
    },
  });
};

/**
 * useGoogleCallback — Resolves Google OAuth token from the URL
 * and populates the Redux store with the authenticated user.
 */
export const useGoogleCallback = () => {
  const dispatch = useDispatch();

  const resolveToken = async (token) => {
    setAuthToken(token);
    const data = await getMe();
    dispatch(setUser(data));
  };

  return { resolveToken };
};
