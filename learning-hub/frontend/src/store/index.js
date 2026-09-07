import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import learningPathReducer from '../features/learningPaths/learningPathSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learningPaths: learningPathReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
