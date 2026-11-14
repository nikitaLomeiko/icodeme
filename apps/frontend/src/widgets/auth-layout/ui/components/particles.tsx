import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const seededValue = (index: number, salt: number) => {
  const value = Math.sin(index * 9283.17 + salt * 77.31) * 43758.5453;
  return value - Math.floor(value);
};

export const Particles: React.FC = () => {
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
            const duration = seededValue(i, 1) * 20 + 15;
            const size = seededValue(i, 2) * 3 + 2;
            const opacity = seededValue(i, 3) * 0.5 + 0.2;

            return (
              <motion.div
                key={i}
                initial={{
                  x: seededValue(i, 4) * windowSize.width,
                  y: seededValue(i, 5) * windowSize.height,
                  opacity: 0,
                }}
                animate={{
                  y: [null, seededValue(i, 6) * windowSize.height],
                  x: [null, seededValue(i, 7) * windowSize.width],
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
