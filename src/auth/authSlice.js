import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleLoginAPI } from './authAPI';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await handleLoginAPI(email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

const storedToken = localStorage.getItem('token');
const storedUser  = JSON.parse(localStorage.getItem('user') || 'null');

const initialState = {
  token: storedToken,
  user: storedUser,
  role:  storedUser?.role || null,
  isAuthenticated: Boolean(storedToken && storedUser),
  loading: false,
  error:   null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user  = null;
      state.role  = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading        = false;
        state.error          = null;
        state.token          = action.payload.token;
        state.user           = action.payload.user;
        state.role           = action.payload.user.role;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
