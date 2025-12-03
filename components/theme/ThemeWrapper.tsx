"use client";

import { useDesignSettings } from '@/hooks/useDesignSettings';
import { ReactNode } from 'react';

interface ThemeWrapperProps {
  children: ReactNode;
  className?: string;
  applyBackground?: boolean;
  applyText?: boolean;
}

export function ThemeWrapper({ 
  children, 
  className = '', 
  applyBackground = true,
  applyText = true 
}: ThemeWrapperProps) {
  const { designSettings } = useDesignSettings();
  
  const style: React.CSSProperties = {};
  
  if (designSettings) {
    if (applyBackground) {
      style.backgroundColor = designSettings.colors.background;
    }
    if (applyText) {
      style.color = designSettings.colors.text;
      style.fontFamily = designSettings.fonts.body;
    }
  }
  
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function ThemedButton({ 
  children, 
  variant = 'primary',
  className = '',
  onClick,
  ...props 
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  const { designSettings } = useDesignSettings();
  
  const getButtonStyle = () => {
    if (!designSettings) return {};
    
    const baseStyle = {
      transition: 'all 0.2s ease',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      fontWeight: '500',
      cursor: 'pointer',
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: designSettings.colors.primary,
          color: '#ffffff',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: designSettings.colors.secondary,
          color: '#ffffff',
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: designSettings.colors.accent,
          color: '#ffffff',
        };
      default:
        return baseStyle;
    }
  };
  
  return (
    <button
      className={`hover:opacity-90 ${className}`}
      style={getButtonStyle()}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function ThemedHeading({ 
  children, 
  level = 1,
  className = '' 
}: {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const { designSettings } = useDesignSettings();
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const style: React.CSSProperties = designSettings ? {
    color: designSettings.colors.primary,
    fontFamily: designSettings.fonts.heading,
  } : {};
  
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}