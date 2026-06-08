import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "motion/react";

interface AnimatedCounterProps {
  to: number;
  suffix?: string;
  id?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  to,
  suffix = "",
  id,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Count up from 0 to "to" in exactly 0.8 seconds
    const controls = animate(0, to, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Fast, lag-free exponential/ease-out deceleration
      onUpdate: (latest) => {
        setCount(Math.round(latest));
      },
      onComplete: () => {
        setCount(to);
      },
    });

    return () => controls.stop();
  }, [isInView, to]);

  // Format with localized comma groupings
  const formattedCount = count.toLocaleString("en-US");

  return (
    <motion.span
      ref={ref}
      id={id}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={isInView ? {
        opacity: 1,
        // Elegant, brief physical scale pop (slight bounce-pop as it enters)
        scale: [0.9, 1.06, 1],
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          scale: {
            times: [0, 0.45, 1],
            duration: 0.6,
          }
        }
      } : {}}
      className="inline-block cursor-default select-none"
    >
      {formattedCount}
      {suffix}
    </motion.span>
  );
};
