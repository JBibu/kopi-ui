import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('kopia-theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    // Remove all existing theme classes
    root.classList.remove('light', 'dark', 'ocean', 'pastel');

    // Add new theme class
    root.classList.add(newTheme);

    // For dark theme, also add the dark class for shadcn/ui components
    if (newTheme === 'dark') {
      root.classList.add('dark');
    }
  };

  // Change theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('kopia-theme', newTheme);
    applyTheme(newTheme);
  };

  // Get available themes
  const themes = [
    { value: 'light', label: 'Light', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
    { value: 'ocean', label: 'Ocean', description: 'Deep blues and teals' },
    { value: 'pastel', label: 'Pastel', description: 'Soft and colorful' }
  ];

  // System theme detection
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const value = {
    theme,
    themes,
    systemTheme,
    changeTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};