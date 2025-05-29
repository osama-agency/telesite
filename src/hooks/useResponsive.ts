import { useState, useEffect } from 'react';

// Breakpoint values matching Tailwind config
const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

interface ResponsiveState {
  width: number;
  height: number;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isUltrawide: boolean;
  isTouchDevice: boolean;
  activeBreakpoint: BreakpointKey;
  isPortrait: boolean;
  isLandscape: boolean;
  pixelRatio: number;
}

export function useResponsive(): ResponsiveState {
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 1200, height: 800 }; // Default fallback for SSR
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    // Set initial size
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Determine active breakpoint
  const getActiveBreakpoint = (width: number): BreakpointKey => {
    if (width >= BREAKPOINTS['3xl']) return '3xl';
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    if (width >= BREAKPOINTS.xs) return 'xs';
    return 'xs'; // Fallback for very small screens
  };

  // Determine device type
  const getDeviceType = (width: number): DeviceType => {
    if (width >= BREAKPOINTS['3xl']) return 'ultrawide';
    if (width >= BREAKPOINTS.lg) return 'desktop';
    if (width >= BREAKPOINTS.sm) return 'tablet';
    return 'mobile';
  };

  // Device type flags
  const deviceType = getDeviceType(windowSize.width);
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isUltrawide = deviceType === 'ultrawide';

  // Touch device detection (approximation based on screen size)
  const isTouchDevice = windowSize.width < BREAKPOINTS.lg;

  // Orientation detection
  const isPortrait = windowSize.height > windowSize.width;
  const isLandscape = windowSize.width > windowSize.height;

  // Pixel ratio for high-DPI displays
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return {
    width: windowSize.width,
    height: windowSize.height,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isUltrawide,
    isTouchDevice,
    activeBreakpoint: getActiveBreakpoint(windowSize.width),
    isPortrait,
    isLandscape,
    pixelRatio,
  };
}

// Hook for checking specific breakpoints
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

// Hook for getting responsive values based on current breakpoint
export function useResponsiveValue<T>(values: Partial<Record<BreakpointKey, T>>): T | undefined {
  const { activeBreakpoint } = useResponsive();
  
  // Find the largest breakpoint that has a value and is <= current breakpoint
  const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpointOrder.indexOf(activeBreakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

// Media query helper
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use addEventListener if available, fallback to addListener for older browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // @ts-ignore - For older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

// Prefab media queries
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsHighDPI = () => useMediaQuery('(min-resolution: 2dppx)');
export const useIsTouchScreen = () => useMediaQuery('(hover: none) and (pointer: coarse)'); 