"use client";

import { useEffect, useState } from "react";
import AddProductForm from "../../Components/Product/AddProductForm/AddProductForm";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AddProductPage() {
  const { user, nextStep, authLoading, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication only after auth is fully initialized
  useEffect(() => {
    // Don't do anything while auth is loading or not initialized
    if (authLoading || !isInitialized) {
      return;
    }

    // Auth is initialized and not loading, so we can make decisions
    setLoading(false);

    // Redirect to login if no user
    if (!user) {
      toast.error("Please log in to submit a product");
      router.push("/auth/login?redirect=/add-product");
      return;
    }

    // Handle onboarding steps if needed
    if (nextStep) {
      const redirectMap = {
        email_verification: "/auth/verify-email",
        phone_verification: "/auth/verify-phone",
        profile_completion: "/complete-profile",
      };

      if (redirectMap[nextStep.type]) {
        toast.error(nextStep.message || "Please complete your profile first");
        router.push(redirectMap[nextStep.type]);
      }
    }
  }, [user, nextStep, router, authLoading, isInitialized]);

  // Show loading state while checking auth
  if (loading || authLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Only show the form if user is authenticated
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-2 text-gray-600">
          Showcase your product to the community and receive valuable feedback
        </p>
      </div>

      <AddProductForm />
    </div>
  );
}
