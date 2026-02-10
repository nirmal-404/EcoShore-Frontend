import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  user: null,
  token: Cookies.get('token') || null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.token) {
        Cookies.set('token', action.payload.token, { expires: 7 });
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      Cookies.remove('token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
