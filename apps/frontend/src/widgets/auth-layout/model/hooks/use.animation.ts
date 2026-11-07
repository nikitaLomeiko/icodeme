import {
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

interface IUseAnimationReturn {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

export const useAnimation = (): IUseAnimationReturn => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [2, -2]), {
    stiffness: 100,
    damping: 20,
    mass: 0.8,
  });

  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-2, 2]), {
    stiffness: 100,
    damping: 20,
    mass: 0.8,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return {
    rotateX,
    rotateY,
  };
};
