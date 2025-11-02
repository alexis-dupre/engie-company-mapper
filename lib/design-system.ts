/**
 * Design System - Inspired by Airbnb's elegant and modern aesthetic
 * Centralized design tokens for consistent styling across the application
 */

export const colors = {
  // Primary palette - Airbnb-inspired coral/rose
  primary: {
    50: '#FFF5F7',
    100: '#FFE8ED',
    200: '#FFD1DC',
    300: '#FFAAC0',
    400: '#FF6B95',
    500: '#FF385C', // Main brand color
    600: '#E61E4D',
    700: '#C13584',
    800: '#A3175F',
    900: '#8B0A3E',
  },

  // Neutral palette - Sophisticated grays
  neutral: {
    50: '#F7F7F7',
    100: '#F0F0F0',
    200: '#E4E4E4',
    300: '#D1D1D1',
    400: '#B0B0B0',
    500: '#717171',
    600: '#484848',
    700: '#333333',
    800: '#222222',
    900: '#111111',
  },

  // Semantic colors
  success: {
    light: '#D4EDDA',
    main: '#00A699',
    dark: '#008A7C',
  },
  warning: {
    light: '#FFF4E5',
    main: '#FFAA00',
    dark: '#D98700',
  },
  error: {
    light: '#FDECEA',
    main: '#E61E4D',
    dark: '#C13584',
  },
  info: {
    light: '#E0F2FE',
    main: '#0EA5E9',
    dark: '#0284C7',
  },
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '6rem',    // 96px
};

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

export const transitions = {
  fast: 'all 150ms ease-in-out',
  normal: 'all 300ms ease-in-out',
  slow: 'all 500ms ease-in-out',
};

export const typography = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Component-specific styles
export const components = {
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    },
    variants: {
      primary: `bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:scale-105 focus:ring-pink-500`,
      secondary: 'bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md focus:ring-gray-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    },
  },
  card: {
    base: 'bg-white rounded-2xl border border-gray-200 transition-all duration-300',
    hover: 'hover:shadow-cardHover hover:-translate-y-1 cursor-pointer',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  input: {
    base: 'w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200',
  },
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
    variants: {
      primary: 'bg-pink-100 text-pink-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      neutral: 'bg-gray-100 text-gray-800',
    },
  },
};

// Utility functions
export const getBoxShadow = (level: keyof typeof shadows) => shadows[level];
export const getSpacing = (size: keyof typeof spacing) => spacing[size];
export const getBorderRadius = (size: keyof typeof borderRadius) => borderRadius[size];

// Gradient utilities
export const gradients = {
  primary: 'bg-gradient-to-r from-pink-500 to-rose-500',
  secondary: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  success: 'bg-gradient-to-r from-green-400 to-teal-500',
  hero: 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50',
  dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
};
