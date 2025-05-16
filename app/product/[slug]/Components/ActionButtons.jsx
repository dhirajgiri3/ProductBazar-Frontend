"use client";

import React, { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useProduct } from "@/lib/contexts/product-context";
import { toast } from "react-hot-toast";
import EditProductModal from "../../../../Components/Modal/Product/EditProductModal";
import DeleteConfirmModal from "../../../../Components/Modal/Product/DeleteConfirmModal";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiArchive,
  FiStar,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiCheck
} from "react-icons/fi";

const ActionButtons = ({ product, onRefresh }) => {
  const { user, isAuthenticated } = useAuth();
  const { updateProduct, deleteProduct, loading } = useProduct();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!product || !isAuthenticated) return null;

  // Check if user is product owner or admin
  const isOwner = user && product.maker && user._id === product.maker._id;
  const isAdmin = user && user.role === "admin";

  // Only render if user has permissions to perform actions
  if (!isOwner && !isAdmin) return null;

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = (updatedProduct) => {
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (loading || actionLoading) return;

    try {
      setActionLoading(true);
      const result = await updateProduct(product.slug, { status: newStatus });

      if (result.success) {
        toast.success(`Product ${newStatus.toLowerCase()} successfully`);
        onRefresh();
      } else {
        toast.error(result.message || "Failed to update product status");
      }
    } catch (error) {
      toast.error("An error occurred while updating product status");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeature = async () => {
    if (loading || actionLoading || !isAdmin) return;

    try {
      setActionLoading(true);
      const result = await updateProduct(product.slug, {
        featured: !product.featured,
      });

      if (result.success) {
        toast.success(
          product.featured
            ? "Product no longer featured"
            : "Product featured successfully"
        );
        onRefresh();
      } else {
        toast.error(result.message || "Failed to update feature status");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            title="Product actions"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-700" />
          </Menu.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-52 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-1">
                {isOwner && (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleEdit}
                          className={`${
                            active
                              ? "bg-violet-50 text-violet-700"
                              : "text-gray-700"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                          disabled={loading || actionLoading}
                        >
                          <FiEdit className="mr-3 h-5 w-5" aria-hidden="true" />
                          Edit Product
                        </button>
                      )}
                    </Menu.Item>

                    {product.status === "Published" && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("Archived")}
                            className={`${
                              active
                                ? "bg-violet-50 text-violet-700"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            disabled={loading || actionLoading}
                          >
                            <FiArchive
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            Archive Product
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {product.status === "Archived" && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("Published")}
                            className={`${
                              active
                                ? "bg-violet-50 text-violet-700"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            disabled={loading || actionLoading}
                          >
                            <FiRefreshCw
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            Restore Product
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {product.status === "Draft" && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("Published")}
                            className={`${
                              active
                                ? "bg-violet-50 text-violet-700"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            disabled={loading || actionLoading}
                          >
                            <FiEye
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            Publish Product
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {(product.status === "Published" ||
                      product.status === "Archived") && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("Draft")}
                            className={`${
                              active
                                ? "bg-violet-50 text-violet-700"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                            disabled={loading || actionLoading}
                          >
                            <FiEyeOff
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            Move to Draft
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </>
                )}

                {isAdmin && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleToggleFeature}
                        className={`${
                          active
                            ? "bg-violet-50 text-violet-700"
                            : "text-gray-700"
                        } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        disabled={loading || actionLoading}
                      >
                        {product.featured ? (
                          <>
                            <FiCheck
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            Unfeature Product
                          </>
                        ) : (
                          <>
                            <FiStar
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            Feature Product
                          </>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                )}

                {isOwner && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleDeleteClick}
                        className={`${
                          active ? "bg-red-50 text-red-700" : "text-red-600"
                        } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        disabled={loading || actionLoading}
                      >
                        <FiTrash2 className="mr-3 h-5 w-5" aria-hidden="true" />
                        Delete Product
                      </button>
                    )}
                  </Menu.Item>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleModalClose}
          product={product}
        />
      )}

      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          product={product}
        />
      )}
    </>
  );
};

export default ActionButtons;
