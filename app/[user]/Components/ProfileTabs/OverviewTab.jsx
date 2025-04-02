"use client";

import { motion } from "framer-motion";
import ProductCard from "../../../../Components/Product/ProfileProductCard";

// Role-based overview sections
const roleSections = {
  startupOwner: ["About", "Skills", "Featured Products", "Company Details"],
  freelancer: ["About", "Skills", "Availability", "Featured Products"],
  investor: ["About", "Activity Overview", "Investment Interests"],
  agency: ["About", "Skills", "Featured Products", "Company Details"],
  jobseeker: ["About", "Skills", "Availability"],
  default: ["About", "Activity Overview"],
};

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function OverviewTab({ user, products = [] }) {
  const featuredProducts = products.slice(0, 3);
  const baseSections = roleSections[user.role] || roleSections.default;

  const switchTab = (tabName) => {
    const tabButtons = document.querySelectorAll("nav button");
    const tabButton = Array.from(tabButtons).find(
      (btn) => btn.textContent === tabName
    );
    if (tabButton) tabButton.click();
  };

  const parseSkills = (skills) => {
    if (!skills || !skills.length) return [];
    try {
      const extractSkills = (item) => {
        if (typeof item !== "string")
          return Array.isArray(item)
            ? item.flatMap(extractSkills)
            : String(item);
        try {
          if (item.includes("[") || item.includes('"')) {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed)
              ? parsed.flatMap(extractSkills)
              : parsed;
          }
          return item;
        } catch {
          return item;
        }
      };
      const processedSkills = Array.isArray(skills)
        ? skills.flatMap(extractSkills)
        : [skills];
      return [
        ...new Set(
          processedSkills
            .filter(Boolean)
            .map((s) =>
              typeof s === "string"
                ? s.replace(/^\[|\]$/g, "").replace(/^"|"$/g, "")
                : String(s)
            )
            .filter((s) => s && s !== '""' && !s.startsWith("["))
        ),
      ];
    } catch (e) {
      console.error("Error parsing skills:", e);
      return [];
    }
  };

  const userSkills = parseSkills(user.skills || []);

  // Filter sections based on available data
  const availableSections = baseSections.filter((section) => {
    switch (section) {
      case "About":
        return true; // Always show About, even if empty
      case "Skills":
        return userSkills.length > 0;
      case "Featured Products":
        return featuredProducts.length > 0;
      case "Company Details":
        return user.companyName || user.companyWebsite || user.companySize;
      case "Availability":
        return user.openToWork !== undefined || user.preferredContact;
      case "Activity Overview":
        return products.length > 0 || user.upvotes > 0;
      case "Investment Interests":
        return user.industry;
      default:
        return false;
    }
  });

  // Split sections into primary (left) and secondary (right/full-width)
  const primarySections = availableSections.filter((s) =>
    ["About", "Skills"].includes(s)
  );
  const secondarySections = availableSections.filter(
    (s) => !["About", "Skills", "Featured Products"].includes(s)
  );
  const hasFeaturedProducts = availableSections.includes("Featured Products");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary Sections */}
        <motion.div
          className={`space-y-6 ${
            secondarySections.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
          }`}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          {primarySections.map((section) => (
            <div
              key={section}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              {section === "About" && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-violet-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    About
                  </h2>
                  {user.about ? (
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {user.about}
                    </p>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-500 text-sm">
                        No description yet.
                      </p>
                      <button
                        onClick={() => switchTab("About")}
                        className="mt-2 text-violet-600 text-sm font-medium hover:text-violet-700"
                      >
                        Add a description
                      </button>
                    </div>
                  )}
                </>
              )}

              {section === "Skills" && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-violet-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userSkills.slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-xs font-medium shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {userSkills.length > 6 && (
                      <button
                        onClick={() => switchTab("Skills")}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 shadow-sm"
                      >
                        +{userSkills.length - 6} more
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </motion.div>

        {/* Right Column: Secondary Sections (if any) */}
        {secondarySections.length > 0 && (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            {secondarySections.map((section) => (
              <div
                key={section}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                {section === "Availability" && (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-violet-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                      Availability
                    </h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.openToWork ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-gray-700 text-sm">
                        {user.openToWork
                          ? "Open to opportunities"
                          : "Not available"}
                      </span>
                    </div>
                    {user.preferredContact && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{user.preferredContact}</span>
                      </div>
                    )}
                  </>
                )}

                {section === "Activity Overview" && (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-violet-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </span>
                      Activity
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Products</span>
                        <span className="text-gray-900 font-medium">
                          {products.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Upvotes</span>
                        <span className="text-gray-900 font-medium">
                          {user.upvotes || 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {section === "Company Details" && (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-violet-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </span>
                      Company
                    </h3>
                    <div className="space-y-2 text-sm">
                      {user.companyName && (
                        <p className="text-gray-700">
                          <span className="font-medium">Name:</span>{" "}
                          {user.companyName}
                        </p>
                      )}
                      {user.companyWebsite && (
                        <p className="text-gray-700">
                          <span className="font-medium">Website:</span>{" "}
                          <a
                            href={user.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:underline"
                          >
                            {user.companyWebsite}
                          </a>
                        </p>
                      )}
                      {user.companySize && (
                        <p className="text-gray-700">
                          <span className="font-medium">Size:</span>{" "}
                          {user.companySize}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {section === "Investment Interests" && (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-violet-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                      Interests
                    </h3>
                    <p className="text-gray-700 text-sm">{user.industry}</p>
                  </>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Featured Products (Full Width) */}
      {hasFeaturedProducts && (
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </span>
              Featured Products
            </h2>
            <button
              onClick={() => switchTab("Products")}
              className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} compact />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
