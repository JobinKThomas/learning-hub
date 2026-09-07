import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sectionApi } from './sectionApi';

/**
 * Thunk: Fetch all sections with optional query parameters
 */
export const fetchSections = createAsyncThunk(
  'sections/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await sectionApi.getAll(params);
      return response.data.data; // { sections: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sections');
    }
  }
);

/**
 * Thunk: Fetch sections for a specific module
 */
export const fetchSectionsByModule = createAsyncThunk(
  'sections/fetchByModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await sectionApi.getByModule(moduleId);
      return response.data.data; // { sections: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch sections for module '${moduleId}'`);
    }
  }
);

/**
 * Thunk: Fetch section details by slug
 */
export const fetchSectionBySlug = createAsyncThunk(
  'sections/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await sectionApi.getBySlug(slug);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch section '${slug}'`);
    }
  }
);

/**
 * Thunk: Fetch section by MongoDB ID (Admin edit)
 */
export const fetchSectionById = createAsyncThunk(
  'sections/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sectionApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch section ID '${id}'`);
    }
  }
);

/**
 * Thunk: Create new section (Admin)
 */
export const createSection = createAsyncThunk(
  'sections/create',
  async (sectionData, { rejectWithValue }) => {
    try {
      const response = await sectionApi.create(sectionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create section');
    }
  }
);

/**
 * Thunk: Update section (Admin)
 */
export const updateSection = createAsyncThunk(
  'sections/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await sectionApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update section');
    }
  }
);

/**
 * Thunk: Delete section (Admin)
 */
export const deleteSection = createAsyncThunk(
  'sections/delete',
  async (id, { rejectWithValue }) => {
    try {
      await sectionApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete section');
    }
  }
);

const initialState = {
  sections: [],
  count: 0,
  currentSection: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  actionSuccess: false,
  error: null,
};

const sectionSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    clearCurrentSection: (state) => {
      state.currentSection = null;
      state.error = null;
    },
    clearSectionActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload.sections || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Module
      .addCase(fetchSectionsByModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectionsByModule.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload.sections || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchSectionsByModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Slug
      .addCase(fetchSectionBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.currentSection = null;
        state.error = null;
      })
      .addCase(fetchSectionBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentSection = action.payload;
      })
      .addCase(fetchSectionBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchSectionById.pending, (state) => {
        state.detailsLoading = true;
        state.currentSection = null;
        state.error = null;
      })
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentSection = action.payload;
      })
      .addCase(fetchSectionById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSection.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createSection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.sections.push(action.payload);
        state.count += 1;
      })
      .addCase(createSection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSection.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateSection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.sections.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
        if (state.currentSection?.id === action.payload.id) {
          state.currentSection = action.payload;
        }
      })
      .addCase(updateSection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSection.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.sections = state.sections.filter((s) => s.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentSection?.id === action.payload) {
          state.currentSection = null;
        }
      })
      .addCase(deleteSection.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentSection, clearSectionActionState } = sectionSlice.actions;
export default sectionSlice.reducer;
