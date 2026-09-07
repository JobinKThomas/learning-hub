import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import learningPathReducer from '../features/learningPaths/learningPathSlice';
import moduleReducer from '../features/modules/moduleSlice';
import sectionReducer from '../features/sections/sectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learningPaths: learningPathReducer,
    modules: moduleReducer,
    sections: sectionReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
