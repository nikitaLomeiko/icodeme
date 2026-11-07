import { motion, MotionValue } from "framer-motion";
import { Title } from "@/shared/ui/kit";

interface IProps {
  children: React.ReactNode;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

export const CardLiquid: React.FC<IProps> = (props) => {
  const { rotateX, rotateY, children } = props;

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      transition={{ type: "spring", stiffness: 100, damping: 30 }}
      className="w-full max-w-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="bg-black-500/70 backdrop-blur-2xl shadow-sm" />

        <motion.div
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-3xl p-[1px] opacity-90"
        />

        <motion.div
          animate={{
            backgroundPosition: [
              "0% 0%",
              "100% 100%",
              "0% 100%",
              "100% 0%",
              "0% 0%",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(99,102,241,0.08), transparent 50%), radial-gradient(circle at 70% 30%, rgba(167,1,236,0.08), transparent 200%)",
            backgroundSize: "200% 200%",
          }}
        />

        <div className="relative p-8 overflow-hidden">
          <div className="relative z-10">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};
