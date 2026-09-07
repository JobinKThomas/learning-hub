import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { noteApi } from './noteApi';

/**
 * Thunk: Fetch all notes with optional query parameters
 */
export const fetchNotes = createAsyncThunk(
  'notes/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await noteApi.getAll(params);
      return response.data.data; // { notes: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notes');
    }
  }
);

/**
 * Thunk: Fetch notes for a specific topic
 */
export const fetchNotesByTopic = createAsyncThunk(
  'notes/fetchByTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await noteApi.getByTopic(topicId);
      return response.data.data; // { notes: [...], count: X }
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch notes for topic '${topicId}'`);
    }
  }
);

/**
 * Thunk: Fetch note details by slug
 */
export const fetchNoteBySlug = createAsyncThunk(
  'notes/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await noteApi.getBySlug(slug);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch note '${slug}'`);
    }
  }
);

/**
 * Thunk: Fetch note by MongoDB ID (Admin edit)
 */
export const fetchNoteById = createAsyncThunk(
  'notes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await noteApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch note ID '${id}'`);
    }
  }
);

/**
 * Thunk: Create new note (Admin)
 */
export const createNote = createAsyncThunk(
  'notes/create',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await noteApi.create(noteData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create note');
    }
  }
);

/**
 * Thunk: Update note (Admin)
 */
export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await noteApi.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update note');
    }
  }
);

/**
 * Thunk: Delete note (Admin)
 */
export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await noteApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete note');
    }
  }
);

const initialState = {
  notes: [],
  count: 0,
  currentNote: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  actionSuccess: false,
  error: null,
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearCurrentNote: (state) => {
      state.currentNote = null;
      state.error = null;
    },
    clearNoteActionState: (state) => {
      state.actionLoading = false;
      state.actionSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Topic
      .addCase(fetchNotesByTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotesByTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchNotesByTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Slug
      .addCase(fetchNoteBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.currentNote = null;
        state.error = null;
      })
      .addCase(fetchNoteBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchNoteBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchNoteById.pending, (state) => {
        state.detailsLoading = true;
        state.currentNote = null;
        state.error = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createNote.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.notes.push(action.payload);
        state.count += 1;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateNote.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.notes.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?.id === action.payload.id) {
          state.currentNote = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteNote.pending, (state) => {
        state.actionLoading = true;
        state.actionSuccess = false;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        state.notes = state.notes.filter((n) => n.id !== action.payload);
        state.count = Math.max(0, state.count - 1);
        if (state.currentNote?.id === action.payload) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentNote, clearNoteActionState } = noteSlice.actions;
export default noteSlice.reducer;
