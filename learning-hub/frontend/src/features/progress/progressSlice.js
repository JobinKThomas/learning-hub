import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { progressApi } from './progressApi';

/**
 * Thunk: Update progress (topic, note, quiz, playground, keyPoint)
 */
export const updateProgress = createAsyncThunk(
  'progress/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await progressApi.updateProgress(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update progress');
    }
  }
);

/**
 * Thunk: Fetch overall user progress across all learning paths
 */
export const fetchOverallProgress = createAsyncThunk(
  'progress/fetchOverall',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressApi.getOverallProgress();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch overall progress');
    }
  }
);

/**
 * Thunk: Fetch progress for a specific topic
 */
export const fetchTopicProgress = createAsyncThunk(
  'progress/fetchTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await progressApi.getTopicProgress(topicId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || `Failed to fetch progress for topic '${topicId}'`
      );
    }
  }
);

/**
 * Thunk: Fetch progress for a specific learning path
 */
export const fetchLearningPathProgress = createAsyncThunk(
  'progress/fetchLearningPath',
  async (pathId, { rejectWithValue }) => {
    try {
      const response = await progressApi.getLearningPathProgress(pathId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          `Failed to fetch progress for learning path '${pathId}'`
      );
    }
  }
);

/**
 * Thunk: Fetch progress for a specific module
 */
export const fetchModuleProgress = createAsyncThunk(
  'progress/fetchModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await progressApi.getModuleProgress(moduleId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.message || `Failed to fetch progress for module '${moduleId}'`
      );
    }
  }
);

const initialState = {
  currentTopicProgress: null,
  currentLearningPathProgress: null,
  currentModuleProgress: null,
  overallProgress: null,
  loading: false,
  topicLoading: false,
  pathLoading: false,
  moduleLoading: false,
  actionLoading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearTopicProgress: (state) => {
      state.currentTopicProgress = null;
    },
    clearLearningPathProgress: (state) => {
      state.currentLearningPathProgress = null;
    },
    clearModuleProgress: (state) => {
      state.currentModuleProgress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Progress
      .addCase(updateProgress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentTopicProgress = action.payload;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch Overall Progress
      .addCase(fetchOverallProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverallProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.overallProgress = action.payload;
      })
      .addCase(fetchOverallProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Topic Progress
      .addCase(fetchTopicProgress.pending, (state) => {
        state.topicLoading = true;
        state.error = null;
      })
      .addCase(fetchTopicProgress.fulfilled, (state, action) => {
        state.topicLoading = false;
        state.currentTopicProgress = action.payload;
      })
      .addCase(fetchTopicProgress.rejected, (state, action) => {
        state.topicLoading = false;
        state.error = action.payload;
      })

      // Fetch Learning Path Progress
      .addCase(fetchLearningPathProgress.pending, (state) => {
        state.pathLoading = true;
        state.error = null;
      })
      .addCase(fetchLearningPathProgress.fulfilled, (state, action) => {
        state.pathLoading = false;
        state.currentLearningPathProgress = action.payload;
      })
      .addCase(fetchLearningPathProgress.rejected, (state, action) => {
        state.pathLoading = false;
        state.error = action.payload;
      })

      // Fetch Module Progress
      .addCase(fetchModuleProgress.pending, (state) => {
        state.moduleLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleProgress.fulfilled, (state, action) => {
        state.moduleLoading = false;
        state.currentModuleProgress = action.payload;
      })
      .addCase(fetchModuleProgress.rejected, (state, action) => {
        state.moduleLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearTopicProgress,
  clearLearningPathProgress,
  clearModuleProgress,
} = progressSlice.actions;

export default progressSlice.reducer;
