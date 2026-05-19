import { create } from 'zustand';
import axiosInstance from '../utils/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  // Set tokens and update authentication state
  setAuth: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  // Clear authentication state and remove tokens from local storage
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ 
      user: null, 
      accessToken: null, 
      refreshToken: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  },

  // Fetch the currently logged-in user profile from Django backend
  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get('/auth/me/');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      get().logout();
      return null;
    }
  },

  // Initialize store state from localStorage tokens on app startup
  initializeAuth: async () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isAuthenticated: true });
        await get().fetchCurrentUser();
      } else {
        set({ isLoading: false });
      }
    }
  }
}));

export default useAuthStore;
