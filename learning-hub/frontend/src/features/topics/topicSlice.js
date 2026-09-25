import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { topicApi } from './topicApi';

/**
 * Thunk: Fetch all topics with optional query parameters
 */
export const fetchTopics = createAsyncThunk(
  'topics/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await topicApi.getAll(params);
      return response.data.data; // { topics: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch topics');
    }
  }
);

/**
 * Thunk: Fetch topics for a specific section
 */
export const fetchTopicsBySection = createAsyncThunk(
  'topics/fetchBySection',
  async (sectionId, { rejectWithValue }) => {
    try {
      const response = await topicApi.getBySection(sectionId);
      return response.data.data; // { topics: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch topics for section '${sectionId}'`);
    }
  }
);

/**
 * Thunk: Fetch topic details by slug
 */
export const fetchTopicBySlug = createAsyncThunk(
  'topics/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await topicApi.getBySlug(slug);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch topic '${slug}'`);
    }
  }
);

/**
 * Thunk: Fetch topic by MongoDB ID (Admin edit)
 */
export const fetchTopicById = createAsyncThunk(
  'topics/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await topicApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch topic ID '${id}'`);
    }
  }
);

/**
 * Thunk: Create new topic (Admin)
 */
export const createTopic = createAsyncThunk(
  'topics/create',
  async (topicData, { rejectWithValue }) => {
    try {
      const response = await topicApi.create(topicData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create topic');
    }
  }
);

/**
 * Thunk: Update topic (Admin)
 */
export const updateTopic = createAsyncThunk(
  'topics/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await topicApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update topic');
    }
  }
);

/**
 * Thunk: Delete topic (Admin)
 */
export const deleteTopic = createAsyncThunk(
  'topics/delete',
  async (id, { rejectWithValue }) => {
    try {
      await topicApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete topic');
    }
  }
);

const initialState = {
  topics: [],
  count: 0,
  currentTopic: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  actionSuccess: false,
  error: null,
};

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
      state.error = null;
    },
    clearTopicActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Section
      .addCase(fetchTopicsBySection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicsBySection.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchTopicsBySection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Slug
      .addCase(fetchTopicBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.currentTopic = null;
        state.error = null;
      })
      .addCase(fetchTopicBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopicBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchTopicById.pending, (state) => {
        state.detailsLoading = true;
        state.currentTopic = null;
        state.error = null;
      })
      .addCase(fetchTopicById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopicById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createTopic.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.topics.push(action.payload);
        state.count += 1;
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateTopic.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.topics.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
        if (state.currentTopic?.id === action.payload.id) {
          state.currentTopic = action.payload;
        }
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteTopic.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.topics = state.topics.filter((t) => t.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentTopic?.id === action.payload) {
          state.currentTopic = null;
        }
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentTopic, clearTopicActionState } = topicSlice.actions;
export default topicSlice.reducer;
