import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interviewQuestionApi } from './interviewQuestionApi';

/**
 * Thunk: Fetch all interview questions with optional query parameters
 */
export const fetchInterviewQuestions = createAsyncThunk(
  'interviewQuestions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await interviewQuestionApi.getAll(params);
      const data = response.data.data;
      const questions = Array.isArray(data) ? data : data?.questions || [];
      const count = response.data.count ?? questions.length;
      return { questions, count };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch interview questions'
      );
    }
  }
);

/**
 * Thunk: Fetch interview questions for a specific topic
 */
export const fetchInterviewQuestionsByTopic = createAsyncThunk(
  'interviewQuestions/fetchByTopic',
  async ({ topicId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await interviewQuestionApi.getByTopic(topicId, params);
      const data = response.data.data;
      const questions = Array.isArray(data) ? data : data?.questions || [];
      const count = response.data.count ?? questions.length;
      return { questions, count };
    } catch (error) {
      return rejectWithValue(
        error.message ||
          `Failed to fetch interview questions for topic '${topicId}'`
      );
    }
  }
);

/**
 * Thunk: Fetch interview question by ID
 */
export const fetchInterviewQuestionById = createAsyncThunk(
  'interviewQuestions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await interviewQuestionApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || `Failed to fetch interview question ID '${id}'`
      );
    }
  }
);

/**
 * Thunk: Create new interview question (Admin)
 */
export const createInterviewQuestion = createAsyncThunk(
  'interviewQuestions/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await interviewQuestionApi.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to create interview question'
      );
    }
  }
);

/**
 * Thunk: Update interview question (Admin)
 */
export const updateInterviewQuestion = createAsyncThunk(
  'interviewQuestions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await interviewQuestionApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to update interview question'
      );
    }
  }
);

/**
 * Thunk: Delete interview question (Admin)
 */
export const deleteInterviewQuestion = createAsyncThunk(
  'interviewQuestions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await interviewQuestionApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to delete interview question'
      );
    }
  }
);

const initialState = {
  questions: [],
  count: 0,
  currentQuestion: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  actionSuccess: false,
  error: null,
};

const interviewQuestionSlice = createSlice({
  name: 'interviewQuestions',
  initialState,
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
      state.error = null;
    },
    clearInterviewQuestionActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchInterviewQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchInterviewQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Topic
      .addCase(fetchInterviewQuestionsByTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewQuestionsByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchInterviewQuestionsByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchInterviewQuestionById.pending, (state) => {
        state.detailsLoading = true;
        state.currentQuestion = null;
        state.error = null;
      })
      .addCase(fetchInterviewQuestionById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchInterviewQuestionById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createInterviewQuestion.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createInterviewQuestion.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.questions.unshift(action.payload);
        state.count += 1;
      })
      .addCase(createInterviewQuestion.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateInterviewQuestion.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateInterviewQuestion.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.questions.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
        if (state.currentQuestion?.id === action.payload.id) {
          state.currentQuestion = action.payload;
        }
      })
      .addCase(updateInterviewQuestion.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteInterviewQuestion.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteInterviewQuestion.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.questions = state.questions.filter((q) => q.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentQuestion?.id === action.payload) {
          state.currentQuestion = null;
        }
      })
      .addCase(deleteInterviewQuestion.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentQuestion, clearInterviewQuestionActionState } =
  interviewQuestionSlice.actions;
export default interviewQuestionSlice.reducer;
