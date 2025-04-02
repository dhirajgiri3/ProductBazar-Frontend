// src/components/ProfileTabs/CollectionsTab.jsx

import { motion } from "framer-motion";

const CollectionsTab = ({ collections = [] }) => {
  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Collections
      </h2>
      
      {collections && collections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, idx) => (
            <motion.div
              key={collection._id || idx}
              className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center text-violet-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {collection.items || 0} items
                </span>
              </div>

              <h3 className="text-lg font-medium text-gray-900 group-hover:text-violet-600 transition-colors mb-2">
                {collection.name}
              </h3>
              
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {collection.description || "No description available"}
              </p>
              
              <button aria-label={`View ${collection.name} collection`} className="text-sm font-medium text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 transition-colors">
                View collection
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
          <p className="text-gray-500 max-w-sm">
            Create collections to organize products and showcase curated content.
          </p>
          <button 
            className="mt-6 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
          >
            Create a Collection
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CollectionsTab;