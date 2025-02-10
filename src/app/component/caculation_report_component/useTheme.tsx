import { useState, useEffect } from 'react';

export default function useTheme() {
  const getPreferredTheme = (): 'dark' | 'light' => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const initializeTheme = (): 'dark' | 'light' => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) return savedTheme;
    const preferredTheme = getPreferredTheme();
    localStorage.setItem('theme', preferredTheme);
    return preferredTheme;
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(initializeTheme);

  const toggleTheme = () => {
    const newTheme: 'dark' | 'light' = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return { theme, toggleTheme };
}
