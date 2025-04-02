import { motion } from "framer-motion";
import clsx from "clsx";

export const FormStep = ({ children, title, isActive }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={clsx(
      "space-y-6 transition-all duration-300",
      isActive ? "block" : "hidden"
    )}
  >
    <h3 className="text-xl font-medium text-gray-900 mb-6">{title}</h3>
    {children}
  </motion.div>
);
