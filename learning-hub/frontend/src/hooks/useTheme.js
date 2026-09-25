import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

/**
 * Custom hook for accessing and toggling light / dark theme
 */
export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme?.theme || 'light');
  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (mode) => dispatch(setTheme(mode)),
  };
}

export default useTheme;
