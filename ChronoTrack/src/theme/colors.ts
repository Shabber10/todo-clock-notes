/**
 * ChronoTrack Design System - 6:3:2 Color Ratio Tokens & Morphism Specs
 * 
 * Ratio breakdown:
 * - 60% Dominant Canvas (Deep Midnight Obsidian #080C16 / Pure Crisp Frost #F4F7FB)
 * - 30% Structural Surfaces (Translucent Frosted Glass & 3D Tactile Clay Containers)
 * - 10-20% High-Impact Neon Accents (Electric Cyan, Emerald Neon, Violet Neon, Solar Amber, Sunset Coral)
 */

export const Palette = {
  // 60% Dominant Canvas Backgrounds
  canvas: {
    dark: '#080C16',
    darkSurface: '#0E1424',
    darkElevated: '#141D32',
    light: '#F4F7FB',
    lightSurface: '#FFFFFF',
    lightElevated: '#EBF1F8',
  },

  // 30% Glassmorphism Translucent Fills & Specular Borders
  glass: {
    dark: 'rgba(18, 26, 44, 0.72)',
    darkElevated: 'rgba(24, 34, 58, 0.82)',
    darkBorder: 'rgba(255, 255, 255, 0.12)',
    darkBorderSpecular: 'rgba(255, 255, 255, 0.22)',
    darkInnerGlow: 'rgba(255, 255, 255, 0.04)',
    
    light: 'rgba(255, 255, 255, 0.82)',
    lightElevated: 'rgba(255, 255, 255, 0.94)',
    lightBorder: 'rgba(255, 255, 255, 0.8)',
    lightBorderSpecular: 'rgba(255, 255, 255, 0.95)',
    lightInnerGlow: 'rgba(255, 255, 255, 0.6)',
  },

  // 30% Claymorphism Dual-Shadow & Bevel Tokens
  clay: {
    dark: {
      bg: '#172036',
      bgPressed: '#12192B',
      border: 'rgba(255, 255, 255, 0.14)',
      shadowOuter: '#04070D',
      shadowInner: '#2A3A5E',
    },
    light: {
      bg: '#EEF3F9',
      bgPressed: '#E2EAF3',
      border: '#FFFFFF',
      shadowOuter: 'rgba(166, 180, 200, 0.7)',
      shadowInner: '#FFFFFF',
    },
  },

  // 10-20% Vibrant Neon Accents
  neon: {
    cyan: '#00F0FF',
    cyanGlow: 'rgba(0, 240, 255, 0.45)',
    cyanSoft: 'rgba(0, 240, 255, 0.14)',

    emerald: '#10B981',
    emeraldBright: '#00E676',
    emeraldGlow: 'rgba(0, 230, 118, 0.45)',
    emeraldSoft: 'rgba(16, 185, 129, 0.14)',

    violet: '#8B5CF6',
    violetBright: '#A855F7',
    violetGlow: 'rgba(168, 85, 247, 0.45)',
    violetSoft: 'rgba(139, 92, 246, 0.14)',

    amber: '#F59E0B',
    amberBright: '#FBBF24',
    amberGlow: 'rgba(251, 191, 36, 0.45)',
    amberSoft: 'rgba(245, 158, 11, 0.14)',

    coral: '#FF3366',
    coralBright: '#F43F5E',
    coralGlow: 'rgba(255, 51, 102, 0.45)',
    coralSoft: 'rgba(255, 51, 102, 0.14)',

    blue: '#3B82F6',
    blueBright: '#60A5FA',
    blueGlow: 'rgba(59, 130, 246, 0.45)',
    blueSoft: 'rgba(59, 130, 246, 0.14)',
  },

  // Category Accent Mappings
  categories: {
    work: '#F59E0B',
    fitness: '#10B981',
    study: '#8B5CF6',
    personal: '#3B82F6',
    habits: '#00F0FF',
  },

  // Priority Accents
  priority: {
    urgent: { bg: '#FF3366', glow: 'rgba(255, 51, 102, 0.4)', text: '#FFF' },
    high: { bg: '#F97316', glow: 'rgba(249, 115, 22, 0.4)', text: '#FFF' },
    medium: { bg: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', text: '#FFF' },
    low: { bg: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)', text: '#FFF' },
  },
};
