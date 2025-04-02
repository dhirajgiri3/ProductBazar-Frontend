// src/components/ProductsTab.jsx
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { useAuth } from "../../../../Contexts/Auth/AuthContext";
import AddProductModal from "../../../../Components/Modal/Product/AddProductModal";
import EditProductModal from "../../../../Components/Modal/Product/EditProductModal";
import DeleteConfirmModal from "../../../../Components/Modal/Product/DeleteConfirmModal";
import ProfileProductCard from "../../../../Components/Product/ProfileProductCard";
import Pagination from "../../../../Components/common/Pagination";
import EmptyState from "../../../../Components/common/EmptyState";
import Tabs from "../../../../Components/common/Tabs";
import LoadingSpinner from "../../../../Components/Common/LoadingSpinner";

export default function ProductsTab({
  products,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  activeFilter = "all",
  statusCounts = { all: 0, published: 0, draft: 0, archived: 0 },
  onPageChange,
  onFilterChange,
  onProductUpdated,
  userId,
  isOwner = false,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { user } = useAuth();

  // Determine if current user is the owner if not explicitly set
  const currentUserIsOwner = isOwner || (user && userId && user._id === userId);

  // Handlers for modal operations
  const handleModalClose = useCallback(
    (updatedProduct) => {
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);

      // Notify parent component to refresh data if product was updated
      if (updatedProduct && onProductUpdated) {
        onProductUpdated();
      }
    },
    [onProductUpdated]
  );

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Tab configuration
  const tabConfig = [
    { id: "all", label: `All (${statusCounts.all})` },
    { id: "published", label: `Published (${statusCounts.published})` },
    { id: "draft", label: `Drafts (${statusCounts.draft})` },
    { id: "archived", label: `Archived (${statusCounts.archived})` },
  ];

  // Loading state
  if (isLoading && !products.length) {
    return <LoadingSpinner message="Loading products..." />;
  }

  // Empty state
  if (!products.length && !isLoading) {
    return (
      <>
        <motion.div
          className="bg-white rounded-xl p-8 shadow-sm border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EmptyState
            title="No products yet"
            description={
              currentUserIsOwner
                ? "Start by adding your first product to showcase your work!"
                : "This user hasn't added any products yet."
            }
            actionButton={
              currentUserIsOwner && (
                <motion.button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Product
                </motion.button>
              )
            }
          />
        </motion.div>
        {currentUserIsOwner && (
          <AddProductModal isOpen={isAddModalOpen} onClose={handleModalClose} />
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          {currentUserIsOwner && (
            <motion.button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Product
            </motion.button>
          )}
        </div>

        {currentUserIsOwner && (
          <Tabs
            tabs={tabConfig}
            activeTab={activeFilter}
            onChange={onFilterChange}
            className="mb-6"
          />
        )}

        {isLoading && products.length > 0 && (
          <div className="flex justify-center my-4">
            <LoadingSpinner size="sm" />
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProfileProductCard
              className="w-full"
              key={product._id}
              product={product}
              onEdit={currentUserIsOwner ? handleEditProduct : undefined}
              onDelete={currentUserIsOwner ? handleDeleteClick : undefined}
              isOwner={currentUserIsOwner}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="mt-8"
          />
        )}

        {products.length === 0 && !isLoading && (
          <EmptyState
            title={`No ${
              activeFilter === "all" ? "products" : `${activeFilter} products`
            }`}
            description={`There are no ${
              activeFilter === "all" ? "" : `${activeFilter} `
            }products to display.`}
            size="sm"
            className="py-8"
          />
        )}
      </motion.div>

      {currentUserIsOwner && (
        <>
          <AddProductModal isOpen={isAddModalOpen} onClose={handleModalClose} />
          {selectedProduct && (
            <>
              <EditProductModal
                isOpen={isEditModalOpen}
                onClose={handleModalClose}
                product={selectedProduct}
              />
              <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleModalClose}
                product={selectedProduct}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
