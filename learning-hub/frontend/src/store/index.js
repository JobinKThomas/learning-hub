import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import learningPathReducer from '../features/learningPaths/learningPathSlice';
import moduleReducer from '../features/modules/moduleSlice';
import sectionReducer from '../features/sections/sectionSlice';
import topicReducer from '../features/topics/topicSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learningPaths: learningPathReducer,
    modules: moduleReducer,
    sections: sectionReducer,
    topics: topicReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
