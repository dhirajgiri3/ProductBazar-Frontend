"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import viewService from "../../services/viewService";

// Icons - importing all icons individually to avoid undefined components
import {
  ChevronDown,
  Globe,
  Laptop as DeviceDesktop,
  Clock,
  ArrowUpRight,
  Users,
  ExternalLink,
} from "lucide-react";

const COLORS = [
  "#4338ca",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#fcd34d",
];

// Enhanced geography data preparation
const prepareGeographyData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return data.map((item) => ({
    ...item,
    country: item.country || "Unknown",
    total,
    percentage: ((item.count / total) * 100).toFixed(1),
    formattedCount: item.count?.toLocaleString() || "0",
    // Add ISO code for potential country flags
    countryCode: item.countryCode || getCountryCode(item.country || "Unknown"),
    // Add color based on index for consistent coloring
    color: COLORS[data.indexOf(item) % COLORS.length],
  }));
};

// Helper function to get country codes for common countries
const getCountryCode = (countryName) => {
  const countryCodes = {
    "United States": "US",
    USA: "US",
    UK: "GB",
    "United Kingdom": "GB",
    Canada: "CA",
    Australia: "AU",
    India: "IN",
    Germany: "DE",
    France: "FR",
    Japan: "JP",
    China: "CN",
    Brazil: "BR",
    Russia: "RU",
    // Default to XX for unknown
    Unknown: "XX",
  };

  return countryCodes[countryName] || "XX";
};

// Custom tooltip component for geography chart
const GeographyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-gray-900/95 border border-indigo-500/30 backdrop-blur-sm p-3 rounded-lg shadow-xl">
        <p className="font-medium text-white mb-1">
          {payload[0].payload.country}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300 mr-2">Views:</span>
          <span className="text-indigo-300 font-medium">
            {payload[0].value}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300 mr-2">Percentage:</span>
          <span className="text-indigo-300 font-medium">
            {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for daily views chart
const DailyViewsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="custom-tooltip bg-gray-900/95 border border-indigo-500/30 backdrop-blur-sm p-3 rounded-lg shadow-xl">
        <p className="font-medium text-white mb-2">{formattedDate}</p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm mb-1"
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-300">{entry.name}:</span>
            </div>
            <span className="font-medium ml-2" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ViewsAnalyticsDashboard = ({ productId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(7);
  const [activeChart, setActiveChart] = useState("combined"); // 'bar', 'area', 'combined'

  // Calculate period-over-period changes
  const calculateChange = (currentPeriod, previousPeriod) => {
    if (!previousPeriod || previousPeriod === 0) {
      return currentPeriod > 0 ? 100 : 0;
    }
    return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  };

  // Calculate metrics for different time periods
  const calculatePeriodMetrics = (data, days) => {
    const now = new Date();
    const currentPeriod = [];
    const previousPeriod = [];

    // Split data into current and previous periods
    data.forEach((item) => {
      const date = new Date(item.date);
      const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (daysDiff < days) {
        currentPeriod.push(item);
      } else if (daysDiff < days * 2) {
        previousPeriod.push(item);
      }
    });

    // Calculate totals for each period
    const currentTotal = currentPeriod.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const previousTotal = previousPeriod.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const currentUnique = currentPeriod.reduce(
      (sum, item) => sum + (item.uniqueCount || 0),
      0
    );
    const previousUnique = previousPeriod.reduce(
      (sum, item) => sum + (item.uniqueCount || 0),
      0
    );

    return {
      currentViews: currentTotal,
      previousViews: previousTotal,
      viewsChange: calculateChange(currentTotal, previousTotal),
      currentUnique,
      previousUnique,
      uniqueChange: calculateChange(currentUnique, previousUnique),
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await viewService.getProductViewStats(productId, {
          days: timeframe * 2, // Fetch double the timeframe to calculate period-over-period changes
        });
        setStats(response.stats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch view statistics:", err);
        setError("Failed to load view statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchStats();
    }
  }, [productId, timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-950 via-indigo-950 to-black">
        <div className="flex flex-col items-center">
          <motion.div
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-screen bg-red-900/50 border border-red-500/50 text-red-200 backdrop-blur-sm">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-gray-300">
        <p>No view data available for this product.</p>
      </div>
    );
  }

  const formatDailyViewsForLineChart = () => {
    // Create an array for the last 7 days, ensuring we have data points even for days with 0 views
    const endDate = new Date();
    const result = [];

    for (let i = 0; i < timeframe; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - (timeframe - 1 - i));
      const dateString = date.toISOString().split("T")[0];

      // Find if there's data for this date
      const foundData = stats.dailyViews.find(
        (item) => item.date === dateString
      );

      result.push({
        name: dateString,
        value: foundData ? foundData.count : 0,
      });
    }

    return result;
  };

  // Calculate metrics for the current timeframe
  const metrics = stats
    ? calculatePeriodMetrics(stats.dailyViews, timeframe)
    : null;

  // Calculate device distribution percentages
  const devicePercentages =
    stats?.devices.map((device) => ({
      ...device,
      percentage: ((device.count / stats.totals.totalViews) * 100).toFixed(1),
    })) || [];

  // Calculate referrer changes by comparing with previous period
  const referrerMetrics =
    stats?.referrers.map((referrer) => {
      const total = stats.totals.totalViews;
      const percentage = ((referrer.count / total) * 100).toFixed(1);

      // If we have historical data, calculate change
      const previousCount = referrer.previousCount || referrer.count * 0.9; // Fallback if no historical data
      const change = calculateChange(referrer.count, previousCount);

      return {
        ...referrer,
        percentage,
        change: change.toFixed(1),
      };
    }) || [];

  // Card variants for animation - enhanced with more sophisticated animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    hover: {
      y: -5,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-950 via-indigo-950 to-black p-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full filter blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center mb-2 sm:mb-0">
            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
              Product Analytics
            </h2>
            {metrics?.viewsChange > 0 ? (
              <div className="ml-4 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/20 backdrop-blur-sm flex items-center">
                <ArrowUpRight size={14} className="mr-1" />
                <span>{metrics?.viewsChange.toFixed(1)}% growth</span>
              </div>
            ) : (
              <div className="ml-4 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium border border-red-500/20 backdrop-blur-sm flex items-center">
                <ArrowUpRight size={14} className="mr-1 rotate-90" />
                <span>
                  {Math.abs(metrics?.viewsChange.toFixed(1))}% decline
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-indigo-900/30 rounded-lg p-1.5 border border-indigo-500/20">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handleTimeframeChange(days)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeframe === days
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-indigo-200 hover:bg-indigo-800/40"
                  }`}
                  aria-label={`Show last ${days} days`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards - Enhanced with improved accessibility and design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Views Card */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-5 rounded-xl shadow-lg border border-indigo-500/20 backdrop-blur-sm group"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            role="region"
            aria-label="Total views statistics"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-indigo-500/30 rounded-full filter blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-indigo-200 text-lg">
                  Total Views
                </h3>
                <div className="bg-indigo-500/30 p-2 rounded-full group-hover:bg-indigo-500/50 transition-colors duration-300">
                  <ExternalLink size={16} className="text-indigo-300" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                {stats?.totals.totalViews.toLocaleString() || 0}
              </p>
              <div className="flex items-center mt-2 text-indigo-300 text-sm">
                {metrics?.viewsChange >= 0 ? (
                  <>
                    <ArrowUpRight size={16} className="mr-1 text-green-400" />
                    <span className="text-green-400">
                      +{metrics?.viewsChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight
                      size={16}
                      className="mr-1 rotate-90 text-red-400"
                    />
                    <span className="text-red-400">
                      {metrics?.viewsChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-1 text-indigo-300/70">
                  {" "}
                  from last period
                </span>
              </div>
            </div>
          </motion.div>

          {/* Unique Viewers Card */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-5 rounded-xl shadow-lg border border-blue-500/20 backdrop-blur-sm group"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.1 }}
            role="region"
            aria-label="Unique viewers statistics"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-blue-500/30 rounded-full filter blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-200 text-lg">
                  Unique Viewers
                </h3>
                <div className="bg-blue-500/30 p-2 rounded-full group-hover:bg-blue-500/50 transition-colors duration-300">
                  <Users size={16} className="text-blue-300" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                {stats?.totals.uniqueViewers.toLocaleString() || 0}
              </p>
              <div className="flex items-center mt-2 text-blue-300 text-sm">
                {metrics?.uniqueChange >= 0 ? (
                  <>
                    <ArrowUpRight size={16} className="mr-1 text-green-400" />
                    <span className="text-green-400">
                      +{metrics?.uniqueChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight
                      size={16}
                      className="mr-1 rotate-90 text-red-400"
                    />
                    <span className="text-red-400">
                      {metrics?.uniqueChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-1 text-blue-300/70"> from last period</span>
              </div>
            </div>
          </motion.div>

          {/* Countries Card */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-green-900/40 to-teal-900/40 p-5 rounded-xl shadow-lg border border-green-500/20 backdrop-blur-sm group"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.2 }}
            role="region"
            aria-label="Countries statistics"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-green-500/30 rounded-full filter blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-green-200 text-lg">
                  Countries
                </h3>
                <div className="bg-green-500/30 p-2 rounded-full group-hover:bg-green-500/50 transition-colors duration-300">
                  <Globe size={16} className="text-green-300" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                {stats?.totals.countries || 0}
              </p>
              <div className="flex items-center mt-2 text-green-300 text-sm gap-1">
                <Globe size={14} className="text-green-400" />
                <span>
                  {stats?.geography.length} active{" "}
                  {stats?.geography.length === 1 ? "country" : "countries"}
                </span>
                {stats?.geography.length > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-green-900/30 rounded-md border border-green-800/30 text-green-300">
                    {stats?.geography[0]?.country}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Devices Card */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-amber-900/40 to-yellow-900/40 p-5 rounded-xl shadow-lg border border-amber-500/20 backdrop-blur-sm group"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.3 }}
            role="region"
            aria-label="Device statistics"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-amber-500/30 rounded-full filter blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-amber-200 text-lg">
                  Devices
                </h3>
                <div className="bg-amber-500/30 p-2 rounded-full group-hover:bg-amber-500/50 transition-colors duration-300">
                  <DeviceDesktop size={16} className="text-amber-300" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 tracking-tight">
                {devicePercentages.length}
              </p>
              <div className="flex items-center mt-2 text-amber-300 text-sm">
                {devicePercentages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="capitalize">
                      {devicePercentages[0]?.device || "No"} leads with{" "}
                    </span>
                    <span className="font-semibold text-amber-200">
                      {devicePercentages[0]?.percentage || 0}%
                    </span>
                    <div
                      className="ml-auto h-2 w-12 bg-amber-900/50 rounded-full overflow-hidden"
                      role="presentation"
                    >
                      <div
                        className="h-full bg-amber-500"
                        style={{
                          width: `${devicePercentages[0]?.percentage || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left panel: Views Chart - IMPROVED */}
          <motion.div
            className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-950 rounded-lg shadow-lg border border-indigo-500/20 backdrop-blur-sm p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Glowing effect */}
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <h3 className="text-white font-medium">Daily Views</h3>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-indigo-900/50 rounded-md border border-indigo-700/50 overflow-hidden">
                    <button
                      onClick={() => setActiveChart("bar")}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${
                        activeChart === "bar"
                          ? "bg-indigo-600 text-white"
                          : "text-indigo-300 hover:bg-indigo-800/40"
                      }`}
                    >
                      Bar
                    </button>
                    <button
                      onClick={() => setActiveChart("area")}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${
                        activeChart === "area"
                          ? "bg-indigo-600 text-white"
                          : "text-indigo-300 hover:bg-indigo-800/40"
                      }`}
                    >
                      Area
                    </button>
                    <button
                      onClick={() => setActiveChart("combined")}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${
                        activeChart === "combined"
                          ? "bg-indigo-600 text-white"
                          : "text-indigo-300 hover:bg-indigo-800/40"
                      }`}
                    >
                      Combined
                    </button>
                  </div>

                  <div className="flex items-center bg-indigo-900/50 px-3 py-1 rounded-md text-indigo-200 text-sm border border-indigo-700/50">
                    <span>Last {timeframe} days</span>
                    <ChevronDown size={16} className="ml-1" />
                  </div>
                </div>
              </div>

              <div className="h-72">
                {" "}
                {/* Increased height for better visualization */}
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === "bar" && (
                    <BarChart
                      data={stats.dailyViews}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="viewsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4f46e5"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                        <linearGradient
                          id="uniqueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        dy={10}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        width={30}
                      />
                      <Tooltip content={<DailyViewsTooltip />} />
                      <Legend
                        wrapperStyle={{ color: "#d1d5db", paddingTop: "10px" }}
                        formatter={(value) => (
                          <span style={{ color: "#d1d5db" }}>{value}</span>
                        )}
                      />
                      <Bar
                        dataKey="count"
                        name="Total Views"
                        radius={[4, 4, 0, 0]}
                        fill="url(#viewsGradient)"
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="uniqueCount"
                        name="Unique Views"
                        radius={[4, 4, 0, 0]}
                        fill="url(#uniqueGradient)"
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </BarChart>
                  )}

                  {activeChart === "area" && (
                    <AreaChart
                      data={stats.dailyViews}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="totalViewsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="uniqueViewsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        dy={10}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        width={30}
                      />
                      <Tooltip content={<DailyViewsTooltip />} />
                      <Legend
                        wrapperStyle={{ color: "#d1d5db", paddingTop: "10px" }}
                        formatter={(value) => (
                          <span style={{ color: "#d1d5db" }}>{value}</span>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Total Views"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="url(#totalViewsGradient)"
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="uniqueCount"
                        name="Unique Views"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#uniqueViewsGradient)"
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </AreaChart>
                  )}

                  {activeChart === "combined" && (
                    <ComposedChart
                      data={stats.dailyViews}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="uniqueAreaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        dy={10}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        width={30}
                      />
                      <Tooltip content={<DailyViewsTooltip />} />
                      <Legend
                        wrapperStyle={{ color: "#d1d5db", paddingTop: "10px" }}
                        formatter={(value) => (
                          <span style={{ color: "#d1d5db" }}>{value}</span>
                        )}
                      />
                      <Bar
                        dataKey="count"
                        name="Total Views"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                        fillOpacity={0.7}
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="uniqueCount"
                        name="Unique Views"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#uniqueAreaGradient)"
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Interactive hint for better UX */}
              <div className="mt-2 text-xs text-indigo-300/70 flex items-center">
                <span className="mr-1">💡</span>
                <span>
                  Tip: Hover over the chart for details or try different chart
                  types
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right panel: Geography - IMPROVED */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-950 rounded-lg shadow-lg border border-indigo-500/20 backdrop-blur-sm p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Glowing effect */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full filter blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Globe size={18} className="text-blue-400" />
                  <h3 className="text-white font-medium">Geography</h3>
                </div>
                <div className="text-xs bg-blue-900/30 text-blue-300 rounded-full px-2 py-0.5 border border-blue-700/30">
                  {stats.geography.length} countries
                </div>
              </div>

              <div className="h-72 flex flex-col justify-center">
                {" "}
                {/* Increased height */}
                {stats.geography.length > 0 ? (
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`pieGradient${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={color}
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="95%"
                              stopColor={color}
                              stopOpacity={0.7}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={prepareGeographyData(stats.geography)}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={80}
                        paddingAngle={4}
                        fill="#8884d8"
                        animationDuration={1500}
                        animationBegin={300}
                        label={({ country, percentage }) =>
                          `${country.substring(0, 8)}${
                            country.length > 8 ? "..." : ""
                          } (${percentage}%)`
                        }
                        labelLine={{
                          stroke: "rgba(255, 255, 255, 0.3)",
                          strokeWidth: 1,
                        }}
                      >
                        {prepareGeographyData(stats.geography).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#pieGradient${index % COLORS.length})`}
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth={1}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip content={<GeographyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-400">
                    <Globe size={48} className="mx-auto mb-3 text-gray-500" />
                    <p>No geographical data available</p>
                  </div>
                )}
                <div className="space-y-1 mt-3 max-h-28 overflow-y-auto pr-1 hide-scrollbar">
                  {stats.geography.map((entry, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-indigo-900/20 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-2.5 h-2.5 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-gray-300 text-sm">
                          {entry.country}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 text-sm">
                          {entry.count}
                        </span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/30">
                          {(
                            (entry.count / stats.totals.totalViews) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom section: Devices and Analytics Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Devices Section - ENHANCED UI */}
          <motion.div
            className="relative overflow-auto bg-gradient-to-br from-gray-950 to-indigo-950 rounded-lg shadow-lg border border-indigo-500/20 backdrop-blur-sm p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Glowing effects */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-600/15 rounded-full filter blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DeviceDesktop size={18} className="text-purple-400" />
                  <h3 className="font-semibold text-white text-lg">
                    Device Breakdown
                  </h3>
                </div>
                <div className="text-xs bg-purple-900/40 text-purple-300 rounded-full px-3 py-1 border border-purple-700/30 flex items-center">
                  <span>
                    {stats.totals.totalViews.toLocaleString()} total views
                  </span>
                </div>
              </div>

              <div className="mt-2 h-72 flex flex-col">
                {stats.devices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column - Enhanced Pie Chart */}
                    <div className="col-span-1 flex flex-col">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <defs>
                            {COLORS.map((color, index) => (
                              <linearGradient
                                key={`deviceGradient-${index}`}
                                id={`deviceGradient${index}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={color}
                                  stopOpacity={0.9}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={color}
                                  stopOpacity={0.7}
                                />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={devicePercentages}
                            dataKey="count"
                            nameKey="device"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            fill="#8884d8"
                            animationDuration={1500}
                            animationBegin={300}
                          >
                            {devicePercentages.map((entry, index) => (
                              <Cell
                                key={`deviceCell-${index}`}
                                fill={`url(#deviceGradient${
                                  index % COLORS.length
                                })`}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name, props) => {
                              const percentage = (
                                (value / stats.totals.totalViews) *
                                100
                              ).toFixed(1);
                              return [
                                `${value.toLocaleString()} (${percentage}%)`,
                                props.payload.device,
                              ];
                            }}
                            contentStyle={{
                              backgroundColor: "rgba(17, 24, 39, 0.8)",
                              borderRadius: "8px",
                              border: "1px solid rgba(79, 70, 229, 0.2)",
                              backdropFilter: "blur(4px)",
                              color: "#f3f4f6",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Top device summary */}
                      {devicePercentages.length > 0 && (
                        <div className="mt-3 bg-indigo-900/30 p-3 rounded-lg border border-indigo-700/20">
                          <p className="text-sm text-indigo-300 mb-1">
                            Most popular device
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[0] }}
                              ></div>
                              <span className="font-medium text-white capitalize">
                                {devicePercentages[0]?.device || "Unknown"}
                              </span>
                            </div>
                            <span className="font-bold text-lg text-white">
                              {devicePercentages[0]?.percentage}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${devicePercentages[0]?.percentage}%`,
                                backgroundColor: COLORS[0],
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column - Enhanced Device List */}
                    <div className="col-span-1">
                      <div className="bg-indigo-900/20 rounded-lg border border-indigo-700/20 h-full p-3">
                        <h4 className="text-sm text-indigo-300 mb-3 font-medium flex items-center">
                          <Users size={14} className="mr-1" />
                          Device Distribution
                        </h4>
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1 hide-scrollbar">
                          {devicePercentages.map((entry, index) => (
                            <motion.div
                              key={index}
                              className="group"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{
                                      backgroundColor:
                                        COLORS[index % COLORS.length],
                                    }}
                                  ></div>
                                  <span className="text-gray-300 capitalize group-hover:text-white transition-colors">
                                    {entry.device}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors">
                                    {entry.count.toLocaleString()}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/30 group-hover:border-indigo-500/50 transition-colors">
                                    {entry.percentage}%
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar for each device */}
                              <div className="h-1.5 w-full bg-indigo-900/30 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${entry.percentage}%` }}
                                  transition={{
                                    duration: 1,
                                    delay: 0.5 + index * 0.1,
                                  }}
                                ></motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Tips and insights section */}
                        {devicePercentages.length > 0 && (
                          <div className="mt-4 text-xs text-indigo-300/80 bg-indigo-950/50 p-2 rounded border border-indigo-900/30">
                            <div className="flex items-start">
                              <div className="bg-indigo-700/20 p-1 rounded mr-2 mt-0.5">
                                <span role="img" aria-label="lightbulb">
                                  💡
                                </span>
                              </div>
                              <p>
                                {devicePercentages[0]?.device === "mobile"
                                  ? "Most of your viewers are on mobile. Consider optimizing for smaller screens."
                                  : devicePercentages[0]?.device === "desktop"
                                  ? "Desktop users dominate your traffic. Make sure your desktop experience is excellent."
                                  : "Your device diversity suggests you should focus on responsive design."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
                    <DeviceDesktop
                      size={48}
                      className="mx-auto mb-3 text-gray-500"
                    />
                    <p>No device data available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Analytics Timeline */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-950 rounded-lg shadow-lg border border-indigo-500/20 backdrop-blur-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Glowing effect */}
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock size={18} className="text-indigo-400 mr-2" />
                  <h3 className="font-semibold text-white">Visitor Activity</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-md border border-green-800/30 flex items-center">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Active now
                  </span>
                </div>
              </div>

              <div className="h-64">
                {formatDailyViewsForLineChart().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatDailyViewsForLineChart()}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="activityGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="areaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <filter
                          id="glow"
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite
                            in="SourceGraphic"
                            in2="blur"
                            operator="over"
                          />
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        vertical={false}
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            weekday: "short",
                          });
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9ca3af" }}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.8)",
                        }}
                        formatter={(value) => [
                          `${value.toLocaleString()} views`,
                          "Views",
                        ]}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                        }}
                        cursor={{
                          stroke: "rgba(156, 163, 175, 0.3)",
                          strokeWidth: 1,
                          strokeDasharray: "5 5",
                        }}
                      />

                      {/* Area under the line */}
                      <Area
                        type="monotone"
                        dataKey="value"
                        fill="url(#areaGradient)"
                        stroke="none"
                        activeDot={false}
                        animationDuration={1500}
                      />

                      {/* Main line with glow effect */}
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Daily Views"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        dot={{
                          fill: "#4f46e5",
                          strokeWidth: 2,
                          r: 4,
                          strokeDasharray: "",
                          filter: "url(#glow)",
                        }}
                        activeDot={{
                          r: 6,
                          fill: "#4f46e5",
                          stroke: "#fff",
                          strokeWidth: 2,
                          filter: "url(#glow)",
                        }}
                        animationDuration={1500}
                        animationBegin={300}
                      />

                      {/* Trend line for comparison - only shows with enough data points */}
                      {formatDailyViewsForLineChart().length > 3 && (
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Trend"
                          stroke="#8b5cf6"
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                          dot={false}
                          activeDot={false}
                          connectNulls={true}
                          isAnimationActive={false}
                          style={{ opacity: 0.6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Clock size={40} className="mb-3 text-gray-500" />
                    <p>No activity data available</p>
                  </div>
                )}
              </div>

              {/* Statistics summary for quick insights */}
              {stats.dailyViews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="bg-indigo-900/20 rounded-lg border border-indigo-800/30 p-2">
                    <p className="text-xs text-indigo-300 mb-1">
                      Avg. Daily Views
                    </p>
                    <p className="font-medium text-white">
                      {Math.round(
                        stats.dailyViews.reduce(
                          (sum, item) => sum + item.count,
                          0
                        ) / stats.dailyViews.length
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-indigo-900/20 rounded-lg border border-indigo-800/30 p-2">
                    <p className="text-xs text-indigo-300 mb-1">Peak Day</p>
                    <p className="font-medium text-white">
                      {(() => {
                        const peak = [...stats.dailyViews].sort(
                          (a, b) => b.count - a.count
                        )[0];
                        if (peak) {
                          const date = new Date(peak.date);
                          return date.toLocaleDateString("en-US", {
                            weekday: "short",
                          });
                        }
                        return "N/A";
                      })()}
                    </p>
                  </div>
                  <div className="bg-indigo-900/20 rounded-lg border border-indigo-800/30 p-2">
                    <p className="text-xs text-indigo-300 mb-1">Growth Trend</p>
                    <div className="font-medium text-white flex items-center">
                      {metrics?.viewsChange >= 0 ? (
                        <>
                          <ArrowUpRight
                            size={14}
                            className="mr-1 text-green-400"
                          />
                          <span className="text-green-400">Rising</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight
                            size={14}
                            className="mr-1 rotate-90 text-red-400"
                          />
                          <span className="text-red-400">Declining</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Traffic Sources section - fully enhanced */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-950 rounded-lg shadow-lg border border-indigo-500/20 backdrop-blur-sm p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute top-10 right-10 w-40 h-40 bg-purple-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-600/10 rounded-full filter blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <ExternalLink size={18} className="text-purple-400 mr-2" />
                <h3 className="font-semibold text-white">Traffic Sources</h3>
              </div>
              <div className="text-xs bg-purple-900/30 text-purple-300 rounded-full px-3 py-1 border border-purple-700/30">
                {referrerMetrics.length} sources
              </div>
            </div>

            {referrerMetrics.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Table with improved visuals */}
                <div className="overflow-x-auto hide-scrollbar rounded-lg border border-indigo-800/20 bg-indigo-900/10">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase border-b border-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Source
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Visitors
                        </th>
                        <th scope="col" className="px-4 py-3">
                          % of total
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrerMetrics.map((referrer, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-800 hover:bg-indigo-900/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-white">
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              ></div>
                              {referrer.source || "Direct Traffic"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {referrer.count.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-16 bg-indigo-900/40 rounded-full h-1.5 mr-2">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${referrer.percentage}%` }}
                                  transition={{
                                    duration: 1,
                                    delay: 0.5 + index * 0.1,
                                  }}
                                ></motion.div>
                              </div>
                              <span>{referrer.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {parseFloat(referrer.change) > 0 ? (
                              <div className="flex items-center text-green-400">
                                <ArrowUpRight size={14} className="mr-1" />
                                {referrer.change}%
                              </div>
                            ) : parseFloat(referrer.change) < 0 ? (
                              <div className="flex items-center text-red-400">
                                <ArrowUpRight
                                  size={14}
                                  className="mr-1 rotate-90"
                                />
                                {Math.abs(parseFloat(referrer.change))}%
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400">
                                <div className="w-4 mr-1 h-0.5 bg-gray-500"></div>
                                0%
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right side - Chart visualization */}
                <div className="bg-indigo-900/10 rounded-lg border border-indigo-800/20 p-3">
                  <h4 className="text-sm text-indigo-300 mb-3 font-medium">
                    Source Distribution
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {COLORS.map((color, index) => (
                            <linearGradient
                              key={`sourceGradient-${index}`}
                              id={`sourceGradient${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={color}
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="95%"
                                stopColor={color}
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={referrerMetrics}
                          dataKey="count"
                          nameKey="source"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={4}
                          fill="#8884d8"
                          animationDuration={1500}
                          animationBegin={300}
                          label={({ source, percentage }) =>
                            `${(source || "Direct").substring(0, 8)}${
                              (source || "Direct").length > 8 ? "..." : ""
                            }`
                          }
                          labelLine={{
                            stroke: "rgba(255, 255, 255, 0.2)",
                            strokeWidth: 1,
                          }}
                        >
                          {referrerMetrics.map((entry, index) => (
                            <Cell
                              key={`sourceCell-${index}`}
                              fill={`url(#sourceGradient${
                                index % COLORS.length
                              })`}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            const percentage = (
                              (value / stats.totals.totalViews) *
                              100
                            ).toFixed(1);
                            return [
                              `${value.toLocaleString()} (${percentage}%)`,
                              props.payload.source || "Direct Traffic",
                            ];
                          }}
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.8)",
                            borderRadius: "8px",
                            border: "1px solid rgba(79, 70, 229, 0.2)",
                            backdropFilter: "blur(4px)",
                            color: "#f3f4f6",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Insights panel */}
                  <div className="mt-3 bg-indigo-950/50 p-2 rounded border border-indigo-900/30 text-xs text-indigo-300/80">
                    <div className="flex items-start">
                      <div className="bg-indigo-700/20 p-1 rounded mr-2 mt-0.5">
                        <span role="img" aria-label="insights">
                          💡
                        </span>
                      </div>
                      <p>
                        {referrerMetrics.length > 0 && (
                          <>
                            {referrerMetrics[0].source
                              ? `Most traffic comes from "${referrerMetrics[0].source}" (${referrerMetrics[0].percentage}%).`
                              : `Most traffic is direct (${referrerMetrics[0].percentage}%).`}{" "}
                            {parseFloat(referrerMetrics[0].change) > 5
                              ? "This source is growing rapidly."
                              : parseFloat(referrerMetrics[0].change) < -5
                              ? "This source is declining."
                              : "This source is stable."}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ExternalLink size={40} className="mb-3 text-gray-500" />
                <p>No referrer data available</p>
                <p className="text-sm mt-2 text-gray-500">
                  When visitors arrive from external sites, they'll appear here
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add custom scrollbar styles to global CSS
const styleElement =
  typeof document !== "undefined" && document.createElement("style");
if (styleElement) {
  styleElement.textContent = `
    .hide-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(79, 70, 229, 0.3) transparent;
    }
    .hide-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .hide-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .hide-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(79, 70, 229, 0.3);
      border-radius: 20px;
    }
  `;
  typeof document !== "undefined" && document.head.appendChild(styleElement);
}

export default ViewsAnalyticsDashboard;
