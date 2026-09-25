import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { learningPathApi } from './learningPathApi';

/**
 * Thunk: Fetch all learning paths with optional filters
 */
export const fetchLearningPaths = createAsyncThunk(
  'learningPaths/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await learningPathApi.getAll(params);
      return response.data.data; // { paths: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch learning paths');
    }
  }
);

/**
 * Thunk: Fetch learning path by slug
 */
export const fetchLearningPathBySlug = createAsyncThunk(
  'learningPaths/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await learningPathApi.getBySlug(slug);
      return response.data.data; // path details
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch path '${slug}'`);
    }
  }
);

/**
 * Thunk: Fetch learning path by MongoDB ID (for Admin Edit)
 */
export const fetchLearningPathById = createAsyncThunk(
  'learningPaths/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await learningPathApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch path ID '${id}'`);
    }
  }
);

/**
 * Thunk: Create new learning path (Admin)
 */
export const createLearningPath = createAsyncThunk(
  'learningPaths/create',
  async (pathData, { rejectWithValue }) => {
    try {
      const response = await learningPathApi.create(pathData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create learning path');
    }
  }
);

/**
 * Thunk: Update learning path (Admin)
 */
export const updateLearningPath = createAsyncThunk(
  'learningPaths/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await learningPathApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update learning path');
    }
  }
);

/**
 * Thunk: Delete learning path (Admin)
 */
export const deleteLearningPath = createAsyncThunk(
  'learningPaths/delete',
  async (id, { rejectWithValue }) => {
    try {
      await learningPathApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete learning path');
    }
  }
);

const initialState = {
  paths: [],
  count: 0,
  currentPath: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  error: null,
  actionSuccess: false,
  filters: {
    category: 'All',
    level: 'All',
    status: 'All',
    search: '',
    sort: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 6,
  },
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const learningPathSlice = createSlice({
  name: 'learningPaths',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      if (action.payload.page === undefined) {
        state.filters.page = 1;
      }
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        category: 'All',
        level: 'All',
        status: 'All',
        search: '',
        sort: 'createdAt',
        order: 'desc',
        page: 1,
        limit: 6,
      };
    },
    clearCurrentPath: (state) => {
      state.currentPath = null;
      state.error = null;
    },
    clearActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchLearningPaths.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningPaths.fulfilled, (state, action) => {
        state.loading = false;
        state.paths = action.payload.paths || [];
        state.count = action.payload.count ?? (action.payload.paths ? action.payload.paths.length : 0);
        state.pagination = action.payload.pagination || {
          page: state.filters.page,
          limit: state.filters.limit,
          total: state.count,
          totalPages: Math.ceil(state.count / state.filters.limit) || 1,
          hasNextPage: false,
          hasPrevPage: false,
        };
      })
      .addCase(fetchLearningPaths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Slug
      .addCase(fetchLearningPathBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.currentPath = null;
        state.error = null;
      })
      .addCase(fetchLearningPathBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentPath = action.payload;
      })
      .addCase(fetchLearningPathBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchLearningPathById.pending, (state) => {
        state.detailsLoading = true;
        state.currentPath = null;
        state.error = null;
      })
      .addCase(fetchLearningPathById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentPath = action.payload;
      })
      .addCase(fetchLearningPathById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createLearningPath.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createLearningPath.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.paths.unshift(action.payload);
        state.count += 1;
      })
      .addCase(createLearningPath.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateLearningPath.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateLearningPath.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.paths.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.paths[index] = action.payload;
        }
        if (state.currentPath?.id === action.payload.id) {
          state.currentPath = action.payload;
        }
      })
      .addCase(updateLearningPath.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteLearningPath.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteLearningPath.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.paths = state.paths.filter((p) => p.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentPath?.id === action.payload) {
          state.currentPath = null;
        }
      })
      .addCase(deleteLearningPath.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setPage,
  resetFilters,
  clearCurrentPath,
  clearActionState,
} = learningPathSlice.actions;

export default learningPathSlice.reducer;
