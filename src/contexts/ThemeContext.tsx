import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const { user } = useAuth();

  // Load theme preference from user profile
  useEffect(() => {
    const loadThemePreference = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.theme_preference) {
            setThemeState(profile.theme_preference as Theme);
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
        }
      } else {
        // Load from localStorage for guests
        const savedTheme = localStorage.getItem('lookmagic-theme') as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      }
    };

    loadThemePreference();
  }, [user]);

  // Update resolved theme based on theme setting
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedTheme);

    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to user profile if authenticated
    if (user) {
      try {
        await supabase
          .from('profiles')
          .upsert({ 
            user_id: user.id, 
            theme_preference: newTheme 
          });
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    } else {
      // Save to localStorage for guests
      localStorage.setItem('lookmagic-theme', newTheme);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};