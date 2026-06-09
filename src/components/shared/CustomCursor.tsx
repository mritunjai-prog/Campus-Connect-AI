import React, { useState, useEffect } from "react";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      {/* Custom Blurry Mouse Follower */}
      <div 
        className="pointer-events-none fixed z-[9999] w-72 h-72 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[60px] transition-transform duration-500 ease-out will-change-transform dark:mix-blend-screen"
        style={{ transform: `translate(${mousePosition.x - 144}px, ${mousePosition.y - 144}px)` }}
      />
      
      {/* Custom Solid Mouse Dot */}
      <div 
        className="pointer-events-none fixed z-[10000] w-3 h-3 rounded-full bg-indigo-500 dark:bg-white shadow-[0_0_10px_rgba(99,102,241,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.8)] border border-white dark:border-indigo-200 transition-transform duration-75 ease-out will-change-transform"
        style={{ transform: `translate(${mousePosition.x - 6}px, ${mousePosition.y - 6}px)` }}
      />
    </>
  );
}
