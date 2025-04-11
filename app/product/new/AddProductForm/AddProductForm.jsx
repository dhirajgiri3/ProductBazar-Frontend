"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import { useDropzone } from "react-dropzone";
import { Check, X, Image as ImageIcon, Rocket, Sparkles } from "lucide-react";

import { useProduct } from "../../../../Contexts/Product/ProductContext";
import { useCategories } from "../../../../Contexts/Category/CategoryContext";
import { useAuth } from "../../../../Contexts/Auth/AuthContext";
import { Balloons } from "../../../../components/ui/balloons";
import CategorySelector from "./Components/CategorySelector";
import RichTextEditor from "./Components/RichTextEditor";
import {
  FormInput,
  PricingTypeSelector,
  TagsInput,
  LinkInput,
} from "./Components/FormComponents";

// Confetti animation
const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.3) },
      colors: ["#8B5CF6", "#C4B5FD", "#6D28D9", "#DDD6FE", "#A78BFA"],
    });
  }, 250);
};

const AddProductForm = () => {
  const router = useRouter();
  const { createProduct, validateProductUrl } = useProduct();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      category: "",
      productUrl: "",
    },
  });

  const [urlStatus, setUrlStatus] = useState(null); // null, 'validating', 'valid', 'invalid'
  const [thumbnail, setThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [links, setLinks] = useState({});
  const [pricingType, setPricingType] = useState("");
  const [price, setPrice] = useState("");
  const [formComplete, setFormComplete] = useState(false);
  const [createdProductSlug, setCreatedProductSlug] = useState(null);
  const balloonsRef = useRef(null);

  // Move useDropzone to top level, always called
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: true,
    onDrop: (files) => {
      if (!thumbnail) setThumbnail(files[0]);
      setGalleryImages((prev) => [
        ...prev,
        ...files.slice(thumbnail ? 0 : 1),
      ]);
    },
    disabled: formComplete, // Disable dropzone when form is complete
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/auth/login?redirect=/add-product");
      toast.error("Please log in to submit a product");
    }
  }, [isAuthenticated, router, authLoading]);

  const handleUrlValidation = async (url) => {
    setUrlStatus("validating");
    const result = await validateProductUrl(url);
    if (result) {
      setUrlStatus("valid");
      setValue("name", result.title || "");
      setValue("tagline", result.description?.substring(0, 100) || "");
      setValue("description", result.description || "");
      if (result.images?.length > 0 && !thumbnail) {
        setThumbnail(result.images[0]);
      }
      setLinks((prev) => ({ ...prev, website: result.url }));
      toast.success("URL validated and data extracted successfully!");
    } else {
      setUrlStatus("invalid");
      toast.error("Invalid or inaccessible URL");
    }
  };

  const onSubmit = async (data) => {
    const productData = {
      productUrl: data.productUrl,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      category: data.category,
      thumbnail,
      galleryImages,
      tags,
      links,
      pricingType,
      price,
    };

    const result = await createProduct(productData);
    if (result && result._id) {
      triggerConfetti();
      if (balloonsRef.current) {
        balloonsRef.current.launchAnimation();
      }
      setCreatedProductSlug(result.slug);
      setFormComplete(true);
      toast.success("Product submitted successfully!");
    }
  };

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (formComplete) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto bg-violet-600 rounded-full flex items-center justify-center mb-6"
          >
            <Check size={40} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Success!</h1>
          <p className="text-gray-600 mb-6">
            Your product has been submitted successfully.
          </p>
          <button
            onClick={() => router.push(`/product/${createdProductSlug}`)}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            View Product
          </button>
          <Balloons
            ref={balloonsRef}
            type="text"
            text="🎉 Success!"
            fontSize={80}
            color="#8B5CF6"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Rocket className="text-violet-600" /> Launch Your Product
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Share your creation with the world. Start with your product URL or
            fill in the details manually.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Product URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product URL
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("productUrl")}
                    onBlur={(e) =>
                      e.target.value && handleUrlValidation(e.target.value)
                    }
                    placeholder="https://yourproduct.com"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleUrlValidation(watch("productUrl"))}
                    disabled={urlStatus === "validating"}
                    className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:bg-gray-400"
                  >
                    {urlStatus === "validating" ? "Checking..." : "Check"}
                  </button>
                </div>
                {urlStatus === "valid" && (
                  <p className="mt-1 text-green-600 flex items-center">
                    <Check size={16} className="mr-1" /> URL Valid
                  </p>
                )}
                {urlStatus === "invalid" && (
                  <p className="mt-1 text-red-600 flex items-center">
                    <X size={16} className="mr-1" /> Invalid URL
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <FormInput
                label="Product Name"
                name="name"
                register={register}
                errors={errors}
                required="Required"
              />
              <FormInput
                label="Tagline"
                name="tagline"
                register={register}
                errors={errors}
                required="Required"
              />
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <CategorySelector
                    categories={categories}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.category?.message}
                    label="Category"
                  />
                )}
              />

              {/* Gallery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gallery
                </label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500"
                >
                  <input {...getInputProps()} />
                  <ImageIcon size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">
                    Drop images here or click to upload
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {thumbnail && (
                    <div className="relative">
                      <img
                        src={
                          typeof thumbnail === "string"
                            ? thumbnail
                            : URL.createObjectURL(thumbnail)
                        }
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setThumbnail(null)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setGalleryImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <Controller
                name="description"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.description?.message}
                    label="Description"
                  />
                )}
              />

              {/* Pricing */}
              <PricingTypeSelector
                value={pricingType}
                onChange={setPricingType}
                price={price}
                onPriceChange={setPrice}
              />

              {/* Tags */}
              <TagsInput tags={tags} setTags={setTags} />

              {/* Links */}
              <LinkInput links={links} setLinks={setLinks} />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                {isSubmitting ? "Submitting..." : "Launch Product"}
              </button>
            </form>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Live Preview
              </h2>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {thumbnail && (
                    <img
                      src={
                        typeof thumbnail === "string"
                          ? thumbnail
                          : URL.createObjectURL(thumbnail)
                      }
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold">
                  {watch("name") || "Your Product Name"}
                </h3>
                <p className="text-gray-600">
                  {watch("tagline") || "Your tagline here"}
                </p>
                <div
                  className="prose text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: watch("description") || "Your description here",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Balloons ref={balloonsRef} type="default" className="absolute z-50" />
    </div>
  );
};

export default AddProductForm;