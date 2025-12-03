"use client";

// Commented out for now - design functionality disabled
// import { useTheme } from '@/context/ThemeContext';

export function useDesignSettings() {
  // const { designSettings } = useTheme();
  const designSettings = null;
  
  const getColorStyle = () => {
    if (!designSettings) return {};
    
    return {
      '--primary': designSettings.colors.primary,
      '--secondary': designSettings.colors.secondary,
      '--accent': designSettings.colors.accent,
      '--background': designSettings.colors.background,
      '--text': designSettings.colors.text,
    } as React.CSSProperties;
  };
  
  const getPrimaryButtonStyle = () => {
    if (!designSettings) return {};
    
    return {
      backgroundColor: designSettings.colors.primary,
      color: '#ffffff',
    };
  };
  
  const getSecondaryButtonStyle = () => {
    if (!designSettings) return {};
    
    return {
      backgroundColor: designSettings.colors.secondary,
      color: '#ffffff',
    };
  };
  
  const getAccentButtonStyle = () => {
    if (!designSettings) return {};
    
    return {
      backgroundColor: designSettings.colors.accent,
      color: '#ffffff',
    };
  };
  
  const getTextStyle = () => {
    if (!designSettings) return {};
    
    return {
      color: designSettings.colors.text,
      fontFamily: designSettings.fonts.body,
    };
  };
  
  const getHeadingStyle = () => {
    if (!designSettings) return {};
    
    return {
      color: designSettings.colors.primary,
      fontFamily: designSettings.fonts.heading,
    };
  };
  
  const getBackgroundStyle = () => {
    if (!designSettings) return {};
    
    return {
      backgroundColor: designSettings.colors.background,
      color: designSettings.colors.text,
    };
  };
  
  return {
    designSettings,
    getColorStyle,
    getPrimaryButtonStyle,
    getSecondaryButtonStyle,
    getAccentButtonStyle,
    getTextStyle,
    getHeadingStyle,
    getBackgroundStyle,
  };
}