import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HiThumbUp,
  HiOutlineThumbUp,
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineEye,
  HiPencil,
} from "react-icons/hi";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext";
import EditProductModal from "../Modal/Product/EditProductModal";

const ProductCard = ({
  product,
  showMaker = true,
  minimal = false,
  isOwner = false,
  onEdit, 
  onDelete,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { toggleUpvote, toggleBookmark } = useProduct();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!product) return null;

  const {
    name,
    slug,
    tagline,
    thumbnail,
    maker,
    pricing,
    upvotes = { count: 0, userHasUpvoted: false },
    bookmarks = { userHasBookmarked: false },
    views = { count: 0 },
    category,
    categoryName,
    deleteProduct,
  } = product;

  // Determine if current user is the product owner if not explicitly passed
  const currentUserIsOwner =
    isOwner || (user && maker && user._id === maker._id);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Trigger auth modal or redirect to login
      window.location.href =
        "/auth/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    // Prevent upvoting your own product
    if (currentUserIsOwner) {
      return;
    }

    await toggleUpvote(slug);
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Trigger auth modal or redirect to login
      window.location.href =
        "/auth/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    await toggleBookmark(slug);
  };

  const openEditModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  // Format price display
  const getPriceDisplay = () => {
    if (pricing?.type === "paid") {
      const currency =
        {
          USD: "$",
          EUR: "€",
          GBP: "£",
        }[pricing.currency] || "$";

      return `${currency}${pricing.amount}`;
    } else if (pricing?.type === "contact") {
      return "Contact";
    } else {
      return "Free";
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex flex-col h-full">
          {/* Thumbnail with overlay */}
          <div className="relative aspect-[16/9] overflow-hidden">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
                <span className="text-gray-400 text-2xl font-light">
                  {name.substring(0, 1)}
                </span>
              </div>
            )}

            {/* Overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Edit button for product owner */}
            {currentUserIsOwner && (
              <button
                onClick={openEditModal}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-violet-500 hover:text-white transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
                aria-label="Edit product"
              >
                <HiPencil className="w-4 h-4" />
              </button>
            )}

            {/* Badges container - positioned for better layout */}
            <div className="absolute top-3 left-3 right-16 flex justify-between items-start">
              {/* Price badge with improved styling */}
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm ${
                  pricing?.type === "paid"
                    ? "bg-amber-500/90 text-white"
                    : pricing?.type === "contact"
                    ? "bg-blue-500/90 text-white"
                    : "bg-emerald-500/90 text-white"
                }`}
              >
                {getPriceDisplay()}
              </div>

              {/* Category badge with improved styling */}
              {!minimal && categoryName && (
                <div className="px-3 py-1.5 rounded-lg bg-violet-500/90 text-white text-xs font-medium backdrop-blur-sm">
                  {categoryName}
                </div>
              )}
            </div>

            {/* View count overlay */}
            {!minimal && views && (
              <div className="absolute bottom-3 left-3 flex items-center px-2.5 py-1 rounded-lg bg-black/30 text-white text-xs backdrop-blur-sm">
                <HiOutlineEye className="w-3.5 h-3.5 mr-1" />
                <span>
                  {views.count > 1000
                    ? `${(views.count / 1000).toFixed(1)}k`
                    : views.count}
                </span>
              </div>
            )}

            {/* Interaction buttons with improved styling */}
            <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleUpvote}
                disabled={currentUserIsOwner}
                className={`p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 ${
                  currentUserIsOwner
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-white hover:text-violet-600"
                }`}
                aria-label={
                  upvotes.userHasUpvoted ? "Remove upvote" : "Upvote product"
                }
                title={
                  currentUserIsOwner
                    ? "Cannot upvote your own product"
                    : upvotes.userHasUpvoted
                    ? "Remove upvote"
                    : "Upvote product"
                }
              >
                {upvotes.userHasUpvoted ? (
                  <HiThumbUp className="w-4 h-4 text-violet-600" />
                ) : (
                  <HiOutlineThumbUp className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleBookmark}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:text-violet-600 transition-all duration-200"
                aria-label={
                  bookmarks.userHasBookmarked
                    ? "Remove bookmark"
                    : "Bookmark product"
                }
              >
                {bookmarks.userHasBookmarked ? (
                  <HiBookmark className="w-4 h-4 text-violet-600" />
                ) : (
                  <HiOutlineBookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Product info with improved typography and spacing */}
          <div className="flex flex-col flex-grow p-5">
            <div className="flex-grow">
              <Link href={`/product/${slug}`} className="block">
                <h3 className="font-semibold text-gray-900 text-lg mb-1.5 line-clamp-1 group-hover:text-violet-600 transition-colors">
                  {name}
                </h3>
              </Link>

              {tagline && (
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                  {tagline}
                </p>
              )}
            </div>

            {/* Footer with maker info and upvotes - improved styling */}
            {showMaker && maker && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                <Link
                  href={`/${maker.username || maker._id}`}
                  className="flex items-center group/maker"
                >
                  {maker.profilePicture ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 mr-2 ring-2 ring-white shadow-sm group-hover/maker:ring-violet-100 transition-all">
                      <Image
                        src={maker.profilePicture?.url || maker.profilePicture}
                        alt={`${maker.firstName} ${maker.lastName}`}
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 flex items-center justify-center text-xs font-medium mr-2 ring-2 ring-white shadow-sm group-hover/maker:ring-violet-100 transition-all">
                      {maker.firstName ? maker.firstName.charAt(0) : "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-700 group-hover/maker:text-violet-600 transition-colors">
                      {maker.firstName} {maker.lastName}
                    </span>
                    {maker.title && (
                      <span className="text-[10px] text-gray-400">
                        {maker.title}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <HiThumbUp className="w-3.5 h-3.5 text-violet-500 mr-1.5" />
                  <span className="text-xs font-medium text-gray-700">
                    {upvotes.count || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product}
        />
      )}
    </>
  );
};

export default ProductCard;
