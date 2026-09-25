import { useSelector, useDispatch } from 'react-redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  clearError,
} from '../store/slices/authSlice';

/**
 * Custom hook to access authentication state and role utilities
 */
export function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const { user, accessToken, refreshToken, isAuthenticated, loading, error } = authState;

  const role = (user?.role || '').toUpperCase();
  const isAdmin = isAuthenticated && role === 'ADMIN';
  const isUser = isAuthenticated && !isAdmin;

  return {
    user,
    role,
    isAdmin,
    isUser,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    logout: () => dispatch(logoutUser()),
    fetchMe: () => dispatch(fetchCurrentUser()),
    clearError: () => dispatch(clearError()),
  };
}

export default useAuth;
