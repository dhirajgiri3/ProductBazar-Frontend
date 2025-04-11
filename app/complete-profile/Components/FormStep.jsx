import { motion } from "framer-motion";
import clsx from "clsx";

export const FormStep = ({ children, title, isActive }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 10 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={clsx(
      "space-y-8 transition-all duration-300",
      isActive ? "block" : "hidden"
    )}
  >
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center space-x-3">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
          {title}
        </h3>
        <div className="h-px flex-grow bg-gradient-to-r from-violet-200 to-transparent"></div>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {title.includes("Review") ?
          "Please review your information before submitting" :
          "Please fill in the following information"}
      </p>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {children}
    </motion.div>
  </motion.div>
);
