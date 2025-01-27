import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export default function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(Dimensions.get("window").width);
    }

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription.remove();
  }, []);

  return {
    isMobile: windowWidth < BREAKPOINTS.md,
    isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,
    isDesktop: windowWidth >= BREAKPOINTS.lg,
    windowWidth,
  };
}
