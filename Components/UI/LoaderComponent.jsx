import { motion } from "framer-motion";

function LoaderComponent({
  text = "Loading",
  message = "Loading",
  size = "default",
}) {
  const containerSize = size === "small" ? "h-16" : "h-28";
  const dotSize = size === "small" ? "w-2 h-2" : "w-3 h-3";
  const textSize = size === "small" ? "text-sm" : "text-base";

  return (
    <motion.div
      className={`flex flex-col items-center justify-center ${containerSize}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSize} rounded-full bg-violet-500`}
            animate={{
              y: ["0%", "-50%", "0%"],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        className={`mt-4 text-white font-medium ${textSize}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {text ? text : message}
      </motion.p>
    </motion.div>
  );
}

export default LoaderComponent;
