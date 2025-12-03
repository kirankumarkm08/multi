"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

// interface DesignSettings {
//   colors: {
//     primary: string;
//     secondary: string;
//     accent: string;
//     background: string;
//     text: string;
//   };
//   fonts: {
//     heading: string;
//     body: string;
//   };
//   logo: {
//     url: string;
//     alt: string;
//   };
//   layout: {
//     maxWidth: string;
//     spacing: string;
//   };
// }

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  // designSettings: DesignSettings | null;
  // updateDesignSettings: (settings: DesignSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  // const [designSettings, setDesignSettings] = useState<DesignSettings | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    
    // // Load design settings
    // const savedDesignSettings = localStorage.getItem('designSettings');
    // if (savedDesignSettings) {
    //   try {
    //     const settings = JSON.parse(savedDesignSettings);
    //     setDesignSettings(settings);
    //   } catch (error) {
    //     console.error('Failed to parse design settings:', error);
    //   }
    // }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // useEffect(() => {
  //   if (mounted && designSettings) {
  //     // Apply custom colors as CSS variables
  //     const root = document.documentElement;
      
  //     // Convert hex to RGB for better color manipulation
  //     const hexToRgb = (hex: string) => {
  //       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  //       return result ? {
  //         r: parseInt(result[1], 16),
  //         g: parseInt(result[2], 16),
  //         b: parseInt(result[3], 16)
  //       } : null;
  //     };
      
  //     // Apply colors
  //     root.style.setProperty('--custom-primary', designSettings.colors.primary);
  //     root.style.setProperty('--custom-secondary', designSettings.colors.secondary);
  //     root.style.setProperty('--custom-accent', designSettings.colors.accent);
  //     root.style.setProperty('--custom-background', designSettings.colors.background);
  //     root.style.setProperty('--custom-text', designSettings.colors.text);
      
  //     // Apply to existing CSS variables for compatibility
  //     const primaryRgb = hexToRgb(designSettings.colors.primary);
  //     const secondaryRgb = hexToRgb(designSettings.colors.secondary);
  //     const bgRgb = hexToRgb(designSettings.colors.background);
  //     const textRgb = hexToRgb(designSettings.colors.text);
      
  //     if (primaryRgb) {
  //       root.style.setProperty('--primary', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
  //     }
  //     if (secondaryRgb) {
  //       root.style.setProperty('--secondary', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
  //     }
  //     if (bgRgb) {
  //       root.style.setProperty('--background', `${bgRgb.r} ${bgRgb.g} ${bgRgb.b}`);
  //     }
  //     if (textRgb) {
  //       root.style.setProperty('--foreground', `${textRgb.r} ${textRgb.g} ${textRgb.b}`);
  //     }
      
  //     // Apply fonts
  //     root.style.setProperty('--font-heading', designSettings.fonts.heading);
  //     root.style.setProperty('--font-body', designSettings.fonts.body);
      
  //     // Apply layout settings
  //     root.style.setProperty('--max-width', designSettings.layout.maxWidth);
  //     root.style.setProperty('--spacing', designSettings.layout.spacing);
  //   }
  // }, [designSettings, mounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // const updateDesignSettings = (settings: DesignSettings) => {
  //   setDesignSettings(settings);
  //   localStorage.setItem('designSettings', JSON.stringify(settings));
  // };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
