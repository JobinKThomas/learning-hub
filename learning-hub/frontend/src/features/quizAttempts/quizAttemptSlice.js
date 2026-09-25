import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizAttemptApi } from './quizAttemptApi';

export const submitQuizAttempt = createAsyncThunk(
  'quizAttempts/submitAttempt',
  async ({ quizId, answers, timeSpentSeconds, startedAt }, { rejectWithValue }) => {
    try {
      const data = await quizAttemptApi.createAttempt(quizId, {
        answers,
        timeSpentSeconds,
        startedAt,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchQuizAttempts = createAsyncThunk(
  'quizAttempts/fetchQuizAttempts',
  async (quizId, { rejectWithValue }) => {
    try {
      const data = await quizAttemptApi.getQuizAttempts(quizId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyAttempts = createAsyncThunk(
  'quizAttempts/fetchMyAttempts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await quizAttemptApi.getMyAttempts(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAttemptById = createAsyncThunk(
  'quizAttempts/fetchAttemptById',
  async (attemptId, { rejectWithValue }) => {
    try {
      const data = await quizAttemptApi.getAttemptById(attemptId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  // Attempts for current quiz
  quizAttempts: [],
  quizStats: null,
  // User's attempts across quizzes
  myAttempts: [],
  myAttemptsTotal: 0,
  // Selected attempt for detailed review
  currentAttempt: null,
  loading: false,
  submitting: false,
  error: null,
};

const quizAttemptSlice = createSlice({
  name: 'quizAttempts',
  initialState,
  reducers: {
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
    },
    clearQuizAttempts: (state) => {
      state.quizAttempts = [];
      state.quizStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // submitQuizAttempt
      .addCase(submitQuizAttempt.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentAttempt = action.payload;
        // prepend to quizAttempts
        state.quizAttempts = [action.payload, ...state.quizAttempts];
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // fetchQuizAttempts
      .addCase(fetchQuizAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.quizAttempts = action.payload.attempts || [];
        state.quizStats = action.payload.stats || null;
      })
      .addCase(fetchQuizAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyAttempts
      .addCase(fetchMyAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.myAttempts = action.payload.attempts || [];
        state.myAttemptsTotal = action.payload.total || 0;
      })
      .addCase(fetchMyAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAttemptById
      .addCase(fetchAttemptById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttemptById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
      })
      .addCase(fetchAttemptById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentAttempt, clearQuizAttempts } = quizAttemptSlice.actions;
export default quizAttemptSlice.reducer;
