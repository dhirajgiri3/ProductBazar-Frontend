import { motion } from "framer-motion";

function LoaderComponent({
  text = "Loading",
  message = "Loading",
  size = "default",
  color = "violet",
}) {
  const containerSize = size === "small" ? "h-16" : "h-24";
  const dotSize = size === "small" ? "w-1.5 h-1.5" : "w-2 h-2";
  const textSize = size === "small" ? "text-xs" : "text-sm";
  const colorClass = `bg-${color}-500`;

  // Optimized animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  const dotVariants = {
    animate: (i) => ({
      y: [0, -8, 0],
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay: i * 0.15,
      }
    })
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center ${containerSize}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-center space-x-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSize} rounded-full ${colorClass}`}
            custom={i}
            variants={dotVariants}
            animate="animate"
          />
        ))}
      </div>
      <motion.p
        className={`mt-3 text-gray-600 font-medium ${textSize}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.2 }}
      >
        {text || message}
      </motion.p>
    </motion.div>
  );
}

export default LoaderComponent;
