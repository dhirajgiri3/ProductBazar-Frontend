import { motion } from "framer-motion";

export default function TrendingStats({ stats }) {
  const statItems = [
    { label: "Products Listed", value: stats.totalProducts },
    { label: "Active Startups", value: stats.activeStartups },
    { label: "Monthly Users", value: stats.monthlyUsers },
    { label: "Investor Network", value: stats.investorNetwork }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
            className="text-2xl font-bold text-blue-600 mb-1"
          >
            {item.value}
          </motion.div>
          <div className="text-sm text-gray-600">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
