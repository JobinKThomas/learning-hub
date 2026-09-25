import { createSlice } from '@reduxjs/toolkit';

// Helper to determine initial theme
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback
  }
  return 'light';
};

const applyThemeToDOM = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (theme === 'dark') {
    root.classList.add('dark');
    if (body) body.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    if (body) body.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
};

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

const initialState = {
  theme: initialTheme,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      try {
        localStorage.setItem('theme', nextTheme);
      } catch {}
      applyThemeToDOM(nextTheme);
    },
    setTheme: (state, action) => {
      const nextTheme = action.payload === 'dark' ? 'dark' : 'light';
      state.theme = nextTheme;
      try {
        localStorage.setItem('theme', nextTheme);
      } catch {}
      applyThemeToDOM(nextTheme);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
