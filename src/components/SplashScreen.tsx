import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../api";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"display" | "closing">("display");

  useEffect(() => {
    // Prefetch critical data in the background
    Promise.allSettled([
      api.get("seputar"),
      api.get("proker"),
      api.get("agenda"),
    ]);

    // Keep the high-end splash screen visible for 4.2 seconds
    const timer = setTimeout(() => {
      setPhase("closing");
      setTimeout(onComplete, 600); // Wait for exit fade animation
    }, 4200);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  // Framer motion variants for elegant staggered entrance
  return (
    <AnimatePresence>
      {phase !== "closing" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center"
        >
          <motion.div 
             initial={{ scale: 1.05, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="w-full h-full relative"
          >
            <picture className="w-full h-full block z-0">
              <source media="(orientation: landscape) and (min-aspect-ratio: 16/10)" srcSet="/gambar/splashscreen-landscape-wide.webp" />
              <source media="(orientation: landscape)" srcSet="/gambar/splashscreen-landscape-short.webp" />
              <source media="(orientation: portrait) and (max-aspect-ratio: 65/100)" srcSet="/gambar/splashscreen-portrait-wide.webp" />
              <img src="/gambar/splashscreen-portrait-short.webp" alt="Splash Screen KPPM" className="w-full h-full object-cover" />
            </picture>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 md:w-64 h-1.5 bg-white/30 backdrop-blur-md rounded-full overflow-hidden z-10 shadow-lg border border-white/10">
              <motion.div 
                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.2, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
