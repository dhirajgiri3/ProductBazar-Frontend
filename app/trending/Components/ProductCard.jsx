import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HiArrowUp, HiBookmark } from "react-icons/hi";
import { formatDistanceToNow } from "date-fns";

export default function ProductCard({ product, index, onUpvote, onSave }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, delay: index * 0.1 } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.02 }}
      className="group backdrop-blur-sm bg-white/60 rounded-xl border border-gray-200/50 
        overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 6}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {product.featured && (
            <div className="absolute top-3 right-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r 
                  from-blue-600 to-indigo-600 rounded-full shadow-lg"
              >
                Featured
              </motion.span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 
              transition-colors line-clamp-1"
            >
              {product.name}
            </h3>
          </Link>
          <div className="flex space-x-2">
            <ActionButton
              onClick={() => onUpvote(product.id)}
              active={product.hasUpvoted}
              icon={<HiArrowUp className="w-5 h-5" />}
              count={product.upvotes}
            />
            <ActionButton
              onClick={() => onSave(product.id)}
              active={product.isSaved}
              icon={<HiBookmark className="w-5 h-5" />}
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.tagline}
        </p>

        <div className="flex items-center justify-between">
          <Link href={`/user/${product.maker.username}`}>
            <div className="flex items-center space-x-2 group/maker">
              <Image
                src={product.maker.avatar}
                alt={product.maker.name}
                width={28}
                height={28}
                className="rounded-full ring-2 ring-white"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 
                  group-hover/maker:text-blue-600 transition-colors">
                  {product.maker.name}
                </span>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(product.createdAt))} ago
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const ActionButton = ({ onClick, active, icon, count }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors
      ${active 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
  >
    {icon}
    {count && <span className="text-sm font-medium">{count}</span>}
  </motion.button>
);
