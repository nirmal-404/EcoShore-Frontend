import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setEvents, setLoading, setError } = eventSlice.actions;
export default eventSlice.reducer;
