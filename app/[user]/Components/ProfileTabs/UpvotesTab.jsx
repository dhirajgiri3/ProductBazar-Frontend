// src/components/ProfileTabs/UpvotesTab.jsx

import { motion } from "framer-motion";

const UpvotesTab = ({ upvotes = 0 }) => {
  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-violet-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          Upvotes
        </h2>

        {/* Stats Summary */}
        <div className="text-right">
          <p className="text-sm text-gray-500">This week</p>
          <p className="font-semibold text-violet-600">
            +{Math.min(upvotes, 5)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="bg-gray-50 rounded-xl p-6 mb-6 w-full max-w-md">
          <div className="text-center">
            <span className="block text-5xl font-bold text-gray-900 mb-2">
              {upvotes}
            </span>
            <span className="text-gray-600">Total Upvotes Received</span>
          </div>
        </div>

        {/* Enhanced Empty State Message */}
        {upvotes === 0 ? (
          <div className="mt-6 text-center max-w-md">
            <p className="text-gray-600 text-sm leading-relaxed">
              Start your journey by sharing your innovative products with our
              community! Each upvote is a token of appreciation from fellow
              creators and users.
            </p>
            <button className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium">
              Share Your First Product
            </button>
          </div>
        ) : (
          <div className="w-full mt-6">
            {/* Upvote Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 text-sm">Monthly Rank</p>
                <p className="font-medium text-gray-900 text-lg">Top 10%</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 text-sm">Achievement</p>
                <p className="font-medium text-gray-900 text-lg">Rising Star</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 text-sm">Streak</p>
                <p className="font-medium text-gray-900 text-lg">
                  {Math.floor(upvotes / 10)} Days
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Next Level</span>
                <span className="text-gray-700 font-medium">
                  {upvotes}/{Math.ceil(upvotes / 50) * 50} upvotes
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500"
                  style={{ width: `${((upvotes % 50) / 50) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {50 - (upvotes % 50)} more upvotes to reach level{" "}
                {Math.floor(upvotes / 50) + 1}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpvotesTab;
