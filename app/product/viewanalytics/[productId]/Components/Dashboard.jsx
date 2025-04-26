"use client";

import React from "react";
import { motion } from "framer-motion";
import withAuth from "../../../../auth/RouteProtector/withAuth";
import ViewsAnalyticsDashboard from "../../../../../Components/View/ViewsAnalyticsDashboard";

function Dashboard({ productId }) {
  if (!productId) {
    return (
      <motion.div
        className="bg-red-50 border border-red-200 p-6 text-red-600 text-center rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-medium">No Product ID provided.</p>
        <p className="text-sm mt-2">Please select a valid product to view analytics.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ViewsAnalyticsDashboard productId={productId} />
    </motion.div>
  );
}

export default withAuth(Dashboard);
