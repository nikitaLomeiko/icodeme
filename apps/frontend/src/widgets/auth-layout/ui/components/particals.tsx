import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Particals = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  return (
    <>
      {windowSize.width > 0 && (
        <>
          {[...Array(50)].map((_, i) => {
            const duration = Math.random() * 20 + 15;
            const size = Math.random() * 3 + 2;
            const opacity = Math.random() * 0.5 + 0.2;

            return (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * windowSize.width,
                  y: Math.random() * windowSize.height,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * windowSize.height],
                  x: [null, Math.random() * windowSize.width],
                  opacity: [opacity, opacity * 0.5, opacity],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  opacity: {
                    duration: duration / 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                }}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  background:
                    i % 3 === 0
                      ? "rgba(99, 102, 241, 0.6)"
                      : i % 3 === 1
                        ? "rgba(16, 185, 129, 0.6)"
                        : "rgba(0, 64, 255, 0.8)",
                  filter: "blur(0.5px)",
                }}
              />
            );
          })}
        </>
      )}
    </>
  );
};
