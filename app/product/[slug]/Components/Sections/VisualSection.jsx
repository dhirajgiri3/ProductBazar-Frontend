import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Globe, Play } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Eye } from 'lucide-react';
import NarrativeParagraph from '../Common/NarrativeParagraph';
import UpvoteButton from 'Components/UI/Buttons/Upvote/UpvoteButton';
import BookmarkButton from 'Components/UI/Buttons/Bookmark/BookmarkButton';
import { fadeInUp } from '../Constants';
import PrimaryButton from 'Components/UI/Buttons/PrimaryButton';

const VisualSection = ({ product, thumbnailUrl, isOwner }) => {
  if (!product) return null;

  return (
    <>
      <NarrativeParagraph delay={0.15} intent="lead">
        Every epic journey starts with a single step, or in this case, a single glance! Feast your
        eyes on <strong>{product.name}</strong> in its natural habitat (or, you know, a nicely
        rendered image).
      </NarrativeParagraph>

      {/* Hero Visual with Enhanced Container */}
      <motion.div variants={fadeInUp} className="my-10 md:my-12 relative group">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-violet-200/60 border-2 border-white bg-gradient-to-br from-violet-50 to-violet-50 p-1.5">
          {/* Fixed thumbnail aspect ratio and height */}
          <div className="relative w-full aspect-[16/9] md:aspect-[16/10] h-auto min-h-[300px]">
            <Image
              src={thumbnailUrl}
              alt={`Hero shot for the story of ${product.name}`}
              fill
              className="object-cover rounded-xl"
              priority
              quality={90}
              onError={e => {
                e.target.src = '/images/placeholder-story-error.png';
              }}
              sizes="(max-width: 640px) 100vw, 800px"
            />
          </div>

          {/* Pricing Overlay */}
          {product.pricing?.type && product.pricing.type !== 'tbd' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute top-3 right-3 z-10 bg-white/85 backdrop-blur-sm text-violet-800 px-3.5 py-1.5 rounded-full font-medium shadow-md border border-violet-100/50 text-xs"
            >
              {product.pricing.type === 'free'
                ? 'Absolutely Free!'
                : product.pricing.type === 'paid'
                ? `${product.pricing.currency || '$'}${product.pricing.amount}`
                : product.pricing.type === 'subscription'
                ? 'Subscription'
                : product.pricing.type === 'freemium'
                ? 'Freemium Option'
                : 'Check Site'}
            </motion.div>
          )}
        </div>

        {/* Core Actions Bar Below Image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-5 w-full"
        >
          {/* Primary CTA Button */}
          {product.links?.website && (
            <PrimaryButton href={product.links.website} target="_blank" rel="noopener noreferrer">
              <Globe size={18} /> Visit Website Now
            </PrimaryButton>
          )}

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-3 sm:order-2">
            {product.links?.demo && (
              <motion.a
                href={product.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl transition-all shadow-sm hover:shadow-md text-base font-medium"
              >
                <Play size={18} className="text-violet-500" /> Try Demo
              </motion.a>
            )}

            {product.links?.github && (
              <motion.a
                href={product.links.github}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl transition-all shadow-sm hover:shadow-md text-base font-medium"
              >
                <FaGithub size={18} className="text-violet-700" /> View Code
              </motion.a>
            )}
          </div>

          {/* View Statistics Button - Only for product owners */}
          {isOwner && (
            <motion.a
              href={`/product/viewanalytics/${product._id}`}
              whileHover={{
                y: -3,
                boxShadow: '0 6px 15px rgba(124, 58, 237, 0.2)',
              }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-violet-200 hover:bg-violet-300 text-violet-900 border border-violet-300 rounded-xl transition-all shadow-sm hover:shadow-md text-base font-medium order-2 sm:order-3"
            >
              <Eye size={18} /> View Statistics
            </motion.a>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Interactions */}
      <NarrativeParagraph delay={0.25} intent="highlight">
        Impressed? Curious? Show some love or bookmark it for later!
      </NarrativeParagraph>
      <div className="mt-4 flex justify-center gap-4">
        <UpvoteButton product={product} source="product_story_chapter1" showText={true} />
        <BookmarkButton product={product} source="product_story_chapter1" showText={true} />
      </div>
    </>
  );
};

export default VisualSection;
