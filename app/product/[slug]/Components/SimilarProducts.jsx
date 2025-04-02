import React from "react";
import { motion } from "framer-motion";
import ProductCard from "../../../../Components/Product/ProfileProductCard";

const SimilarProducts = ({ products = [] }) => {
  // Ensure we have a valid array of products
  const validProducts = Array.isArray(products) 
    ? products.filter(p => p && (p.product || p)) 
    : [];

  if (validProducts.length === 0) {
    return null; // Don't render the section if no similar products
  }

  return (
    <section className="py-5">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Similar Products
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {validProducts.map((item, index) => {
          // Handle both direct product objects or nested product objects
          const product = item.product || item;
          
          return (
            <motion.div
              key={product._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <ProductCard product={product} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarProducts;
