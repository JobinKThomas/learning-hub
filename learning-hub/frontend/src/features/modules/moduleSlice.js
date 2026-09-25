import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { moduleApi } from './moduleApi';

/**
 * Thunk: Fetch all modules with optional query parameters
 */
export const fetchModules = createAsyncThunk(
  'modules/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await moduleApi.getAll(params);
      return response.data.data; // { modules: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch modules');
    }
  }
);

/**
 * Thunk: Fetch modules for a specific learning path
 */
export const fetchModulesByLearningPath = createAsyncThunk(
  'modules/fetchByLearningPath',
  async (learningPathId, { rejectWithValue }) => {
    try {
      const response = await moduleApi.getByLearningPath(learningPathId);
      return response.data.data; // { modules: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch modules for path '${learningPathId}'`);
    }
  }
);

/**
 * Thunk: Fetch module details by slug
 */
export const fetchModuleBySlug = createAsyncThunk(
  'modules/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await moduleApi.getBySlug(slug);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch module '${slug}'`);
    }
  }
);

/**
 * Thunk: Fetch module by MongoDB ID (Admin edit)
 */
export const fetchModuleById = createAsyncThunk(
  'modules/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await moduleApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch module ID '${id}'`);
    }
  }
);

/**
 * Thunk: Create new module (Admin)
 */
export const createModule = createAsyncThunk(
  'modules/create',
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await moduleApi.create(moduleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create module');
    }
  }
);

/**
 * Thunk: Update module (Admin)
 */
export const updateModule = createAsyncThunk(
  'modules/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await moduleApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update module');
    }
  }
);

/**
 * Thunk: Delete module (Admin)
 */
export const deleteModule = createAsyncThunk(
  'modules/delete',
  async (id, { rejectWithValue }) => {
    try {
      await moduleApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete module');
    }
  }
);

const initialState = {
  modules: [],
  count: 0,
  currentModule: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  actionSuccess: false,
  error: null,
};

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    clearCurrentModule: (state) => {
      state.currentModule = null;
      state.error = null;
    },
    clearModuleActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload.modules || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Learning Path
      .addCase(fetchModulesByLearningPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModulesByLearningPath.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload.modules || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchModulesByLearningPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Slug
      .addCase(fetchModuleBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.currentModule = null;
        state.error = null;
      })
      .addCase(fetchModuleBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentModule = action.payload;
      })
      .addCase(fetchModuleBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchModuleById.pending, (state) => {
        state.detailsLoading = true;
        state.currentModule = null;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentModule = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createModule.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.modules.push(action.payload);
        state.count += 1;
      })
      .addCase(createModule.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateModule.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.modules.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.currentModule?.id === action.payload.id) {
          state.currentModule = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteModule.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.modules = state.modules.filter((m) => m.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentModule?.id === action.payload) {
          state.currentModule = null;
        }
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentModule, clearModuleActionState } = moduleSlice.actions;
export default moduleSlice.reducer;
