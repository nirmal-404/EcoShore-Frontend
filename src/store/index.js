import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import beachReducer from './beachSlice';
import eventReducer from './eventSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    beaches: beachReducer,
    events: eventReducer,
  },
});
