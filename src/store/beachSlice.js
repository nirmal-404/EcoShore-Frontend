import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  beaches: [],
  loading: false,
  error: null,
};

const beachSlice = createSlice({
  name: 'beaches',
  initialState,
  reducers: {
    setBeaches: (state, action) => {
      state.beaches = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setBeaches, setLoading, setError } = beachSlice.actions;
export default beachSlice.reducer;
