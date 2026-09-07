import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import learningPathReducer from '../features/learningPaths/learningPathSlice';
import moduleReducer from '../features/modules/moduleSlice';
import sectionReducer from '../features/sections/sectionSlice';
import topicReducer from '../features/topics/topicSlice';
import noteReducer from '../features/notes/noteSlice';
import resourceReducer from '../features/resources/resourceSlice';
import playgroundReducer from '../features/playgrounds/playgroundSlice';
import quizReducer from '../features/quizzes/quizSlice';
import quizAttemptReducer from '../features/quizAttempts/quizAttemptSlice';
import interviewQuestionReducer from '../features/interviewQuestions/interviewQuestionSlice';
import progressReducer from '../features/progress/progressSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learningPaths: learningPathReducer,
    modules: moduleReducer,
    sections: sectionReducer,
    topics: topicReducer,
    notes: noteReducer,
    resources: resourceReducer,
    playgrounds: playgroundReducer,
    quizzes: quizReducer,
    quizAttempts: quizAttemptReducer,
    interviewQuestions: interviewQuestionReducer,
    progress: progressReducer,
    dashboard: dashboardReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
