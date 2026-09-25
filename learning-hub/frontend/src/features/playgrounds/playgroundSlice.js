import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playgroundApi } from './playgroundApi';

export const fetchPlaygrounds = createAsyncThunk(
  'playgrounds/fetchPlaygrounds',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await playgroundApi.getAll(params);
      return data.data.playgrounds;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPlaygroundsByTopic = createAsyncThunk(
  'playgrounds/fetchPlaygroundsByTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const data = await playgroundApi.getByTopic(topicId);
      return data.data.playgrounds;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPlaygroundBySlug = createAsyncThunk(
  'playgrounds/fetchPlaygroundBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const data = await playgroundApi.getBySlug(slug);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPlaygroundById = createAsyncThunk(
  'playgrounds/fetchPlaygroundById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await playgroundApi.getById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const runCodeExecution = createAsyncThunk(
  'playgrounds/runCodeExecution',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await playgroundApi.runCode(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createPlayground = createAsyncThunk(
  'playgrounds/createPlayground',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await playgroundApi.create(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePlayground = createAsyncThunk(
  'playgrounds/updatePlayground',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await playgroundApi.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deletePlayground = createAsyncThunk(
  'playgrounds/deletePlayground',
  async (id, { rejectWithValue }) => {
    try {
      await playgroundApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  playgrounds: [],
  topicPlaygrounds: [],
  currentPlayground: null,
  executionResult: null,
  isExecuting: false,
  loading: false,
  detailsLoading: false,
  error: null,
};

const playgroundSlice = createSlice({
  name: 'playgrounds',
  initialState,
  reducers: {
    clearExecutionResult: (state) => {
      state.executionResult = null;
    },
    clearCurrentPlayground: (state) => {
      state.currentPlayground = null;
      state.executionResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPlaygrounds
      .addCase(fetchPlaygrounds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaygrounds.fulfilled, (state, action) => {
        state.loading = false;
        state.playgrounds = action.payload;
      })
      .addCase(fetchPlaygrounds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchPlaygroundsByTopic
      .addCase(fetchPlaygroundsByTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaygroundsByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topicPlaygrounds = action.payload;
      })
      .addCase(fetchPlaygroundsByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchPlaygroundBySlug
      .addCase(fetchPlaygroundBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchPlaygroundBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentPlayground = action.payload;
      })
      .addCase(fetchPlaygroundBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // fetchPlaygroundById
      .addCase(fetchPlaygroundById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchPlaygroundById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentPlayground = action.payload;
      })
      .addCase(fetchPlaygroundById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // runCodeExecution
      .addCase(runCodeExecution.pending, (state) => {
        state.isExecuting = true;
      })
      .addCase(runCodeExecution.fulfilled, (state, action) => {
        state.isExecuting = false;
        state.executionResult = action.payload;
      })
      .addCase(runCodeExecution.rejected, (state, action) => {
        state.isExecuting = false;
        state.executionResult = {
          success: false,
          logs: [],
          result: null,
          executionTimeMs: 0,
          error: action.payload || 'Failed to execute code',
        };
      })

      // createPlayground
      .addCase(createPlayground.fulfilled, (state, action) => {
        state.playgrounds.unshift(action.payload);
      })

      // updatePlayground
      .addCase(updatePlayground.fulfilled, (state, action) => {
        const index = state.playgrounds.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.playgrounds[index] = action.payload;
        }
        if (state.currentPlayground?.id === action.payload.id) {
          state.currentPlayground = action.payload;
        }
      })

      // deletePlayground
      .addCase(deletePlayground.fulfilled, (state, action) => {
        state.playgrounds = state.playgrounds.filter((p) => p.id !== action.payload);
        if (state.currentPlayground?.id === action.payload) {
          state.currentPlayground = null;
        }
      });
  },
});

export const { clearExecutionResult, clearCurrentPlayground } = playgroundSlice.actions;
export default playgroundSlice.reducer;
