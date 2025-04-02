"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiInfo,
  FiList,
  FiPackage,
  FiHelpCircle,
  FiTool,
} from "react-icons/fi";

const ProductTabs = ({ product, isOwner, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("description");

  // Check which tabs should be available based on product data
  const hasTechnicalInfo = product?.technicalDetails || product?.requirements;
  const hasFeatures = product?.features && product.features.length > 0;
  const hasFaq = product?.faq && product.faq.length > 0;

  // Generate tabs based on available data
  const tabs = [
    {
      id: "description",
      label: "Description",
      icon: <FiInfo className="mr-1" />,
    },
    ...(hasFeatures
      ? [
          {
            id: "features",
            label: "Features",
            icon: <FiList className="mr-1" />,
          },
        ]
      : []),
    ...(hasTechnicalInfo
      ? [
          {
            id: "technical",
            label: "Technical Info",
            icon: <FiTool className="mr-1" />,
          },
        ]
      : []),
    ...(hasFaq
      ? [
          {
            id: "faq",
            label: "FAQ",
            icon: <FiHelpCircle className="mr-1" />,
          },
        ]
      : []),
    {
      id: "about",
      label: "About Product",
      icon: <FiPackage className="mr-1" />,
    },
  ];

  return (
    <div>
      {/* Tabs navigation */}
      <div className="border-b border-gray-200 -mx-8 px-8">
        <nav
          className="flex space-x-6 overflow-x-auto hide-scrollbar pb-px"
          aria-label="Product tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 relative font-medium text-sm whitespace-nowrap transition-colors flex items-center ${
                activeTab === tab.id
                  ? "text-violet-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="py-6">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <TabPanel key="description">
              {product?.description ? (
                <div className="prose prose-violet max-w-none">
                  {/* Check if description is HTML (from rich text editor) */}
                  {product.description.includes("<") &&
                  product.description.includes(">") ? (
                    // Render HTML content safely
                    <div
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    // Fallback for plain text descriptions
                    product.description
                      .split("\n")
                      .map((paragraph, i) =>
                        paragraph.trim() ? (
                          <p key={i}>{paragraph}</p>
                        ) : (
                          <br key={i} />
                        )
                      )
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided.</p>
              )}
            </TabPanel>
          )}

          {activeTab === "features" && hasFeatures && (
            <TabPanel key="features">
              <ul className="space-y-4">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      {feature.title && (
                        <h3 className="font-medium text-gray-900">
                          {feature.title}
                        </h3>
                      )}
                      {feature.description && (
                        <p className="text-gray-600 mt-1">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </TabPanel>
          )}

          {activeTab === "technical" && hasTechnicalInfo && (
            <TabPanel key="technical">
              <div className="space-y-6">
                {product.technicalDetails && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Technical Details
                    </h3>
                    <div className="prose prose-violet max-w-none">
                      {product.technicalDetails.includes("<") &&
                      product.technicalDetails.includes(">") ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: product.technicalDetails,
                          }}
                        />
                      ) : (
                        product.technicalDetails
                          .split("\n")
                          .map((paragraph, i) =>
                            paragraph.trim() ? (
                              <p key={i}>{paragraph}</p>
                            ) : (
                              <br key={i} />
                            )
                          )
                      )}
                    </div>
                  </div>
                )}

                {product.requirements && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Requirements
                    </h3>
                    <div className="prose prose-violet max-w-none">
                      {product.requirements.includes("<") &&
                      product.requirements.includes(">") ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: product.requirements,
                          }}
                        />
                      ) : (
                        product.requirements
                          .split("\n")
                          .map((paragraph, i) =>
                            paragraph.trim() ? (
                              <p key={i}>{paragraph}</p>
                            ) : (
                              <br key={i} />
                            )
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>
          )}

          {activeTab === "faq" && hasFaq && (
            <TabPanel key="faq">
              <div className="space-y-6">
                {product.faq.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {item.question}
                    </h3>
                    {item.answer.includes("<") && item.answer.includes(">") ? (
                      <div
                        className="text-gray-600"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                    ) : (
                      <p className="text-gray-600">{item.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </TabPanel>
          )}

          {activeTab === "about" && (
            <TabPanel key="about">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* General info */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      General Info
                    </h3>
                    <div className="space-y-3">
                      {product.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Added</span>
                          <span className="text-gray-900">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {product.updatedAt &&
                        product.updatedAt !== product.createdAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Updated</span>
                            <span className="text-gray-900">
                              {new Date(product.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="text-gray-900">
                          {product.categoryName || "Uncategorized"}
                        </span>
                      </div>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tags</span>
                          <div className="text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              {product.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Upvotes</span>
                        <span className="text-gray-900">
                          {product.upvotes?.count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views</span>
                        <span className="text-gray-900">
                          {product.views?.count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comments</span>
                        <span className="text-gray-900">
                          {product.comments?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saves</span>
                        <span className="text-gray-900">
                          {product.bookmarks?.count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maker info (if available) */}
                {product.maker && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      About the Maker
                    </h3>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        {product.maker.profilePicture?.url ? (
                          <img
                            src={product.maker.profilePicture.url}
                            alt={`${product.maker.firstName || ""} ${
                              product.maker.lastName || ""
                            }`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-500 text-lg font-semibold">
                            {product.maker.firstName
                              ? product.maker.firstName.charAt(0).toUpperCase()
                              : "M"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.maker.firstName
                            ? `${product.maker.firstName} ${
                                product.maker.lastName || ""
                              }`
                            : product.makerProfile?.name || "Maker"}
                        </h4>
                        {product.maker.bio && (
                          <p className="text-gray-600 mt-1">
                            {product.maker.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Reusable TabPanel component with animation
const TabPanel = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export default ProductTabs;
