import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizApi } from './quizApi';

export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchQuizzes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await quizApi.getAll(params);
      return data.data.quizzes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchQuizzesByTopic = createAsyncThunk(
  'quizzes/fetchQuizzesByTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const data = await quizApi.getByTopic(topicId);
      return data.data.quizzes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchQuizById',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const data = await quizApi.getById(id, params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const submitQuizAnswers = createAsyncThunk(
  'quizzes/submitQuizAnswers',
  async ({ id, answers }, { rejectWithValue }) => {
    try {
      const data = await quizApi.submit(id, answers);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/createQuiz',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await quizApi.create(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/updateQuiz',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await quizApi.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/deleteQuiz',
  async (id, { rejectWithValue }) => {
    try {
      await quizApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  quizzes: [],
  topicQuizzes: [],
  currentQuiz: null,
  submissionResult: null,
  submitting: false,
  loading: false,
  detailsLoading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearSubmissionResult: (state) => {
      state.submissionResult = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
      state.submissionResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchQuizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchQuizzesByTopic
      .addCase(fetchQuizzesByTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzesByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topicQuizzes = action.payload;
      })
      .addCase(fetchQuizzesByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchQuizById
      .addCase(fetchQuizById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // submitQuizAnswers
      .addCase(submitQuizAnswers.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitQuizAnswers.fulfilled, (state, action) => {
        state.submitting = false;
        state.submissionResult = action.payload;
      })
      .addCase(submitQuizAnswers.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // createQuiz
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzes.unshift(action.payload);
      })

      // updateQuiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const idx = state.quizzes.findIndex((q) => q.id === action.payload.id);
        if (idx !== -1) {
          state.quizzes[idx] = action.payload;
        }
        if (state.currentQuiz?.id === action.payload.id) {
          state.currentQuiz = action.payload;
        }
      })

      // deleteQuiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
        if (state.currentQuiz?.id === action.payload) {
          state.currentQuiz = null;
        }
      });
  },
});

export const { clearSubmissionResult, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;
