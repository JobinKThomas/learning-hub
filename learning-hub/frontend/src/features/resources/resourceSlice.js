import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resourceApi } from './resourceApi';

/**
 * Thunk: Fetch all resources with optional query parameters
 */
export const fetchResources = createAsyncThunk(
  'resources/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await resourceApi.getAll(params);
      return response.data.data; // { resources: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch resources');
    }
  }
);

/**
 * Thunk: Fetch resources for a specific topic
 */
export const fetchResourcesByTopic = createAsyncThunk(
  'resources/fetchByTopic',
  async ({ topicId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await resourceApi.getByTopic(topicId, params);
      return response.data.data; // { resources: [...], count: X }
    } catch (error) {
      return rejectWithValue(
        error.message || `Failed to fetch resources for topic '${topicId}'`
      );
    }
  }
);

/**
 * Thunk: Fetch resource by ID
 */
export const fetchResourceById = createAsyncThunk(
  'resources/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await resourceApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch resource ID '${id}'`);
    }
  }
);

/**
 * Thunk: Create new resource (Admin)
 */
export const createResource = createAsyncThunk(
  'resources/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await resourceApi.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create resource');
    }
  }
);

/**
 * Thunk: Update resource (Admin)
 */
export const updateResource = createAsyncThunk(
  'resources/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await resourceApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update resource');
    }
  }
);

/**
 * Thunk: Delete resource (Admin)
 */
export const deleteResource = createAsyncThunk(
  'resources/delete',
  async (id, { rejectWithValue }) => {
    try {
      await resourceApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete resource');
    }
  }
);

const initialState = {
  resources: [],
  count: 0,
  currentResource: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  actionSuccess: false,
  error: null,
};

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearCurrentResource: (state) => {
      state.currentResource = null;
      state.error = null;
    },
    clearResourceActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload.resources || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Topic
      .addCase(fetchResourcesByTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourcesByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload.resources || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchResourcesByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchResourceById.pending, (state) => {
        state.detailsLoading = true;
        state.currentResource = null;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createResource.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.resources.push(action.payload);
        state.count += 1;
      })
      .addCase(createResource.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateResource.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.resources.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        if (state.currentResource?.id === action.payload.id) {
          state.currentResource = action.payload;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteResource.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.resources = state.resources.filter((r) => r.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentResource?.id === action.payload) {
          state.currentResource = null;
        }
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentResource, clearResourceActionState } =
  resourceSlice.actions;
export default resourceSlice.reducer;
