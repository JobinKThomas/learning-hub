import '@testing-library/jest-dom';

// Global mocks for window methods missing in JSDOM
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}
