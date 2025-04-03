"use client";

import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm/AddProductForm";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import InteractiveBackground from "../../Components/UI/Background/InteractiveBackground";
import LoaderComponent from "../../Components/ui/LoaderComponent";

export default function AddProductPage() {
  const { user, nextStep, authLoading, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !isInitialized) {
      return;
    }
    setLoading(false);

    if (!user) {
      toast.error("Please log in to submit a product", { icon: '🔑'});
      router.push("/auth/login?redirect=/add-product");
      return;
    }

    if (nextStep) {
      const redirectMap = {
        email_verification: "/auth/verify-email",
        phone_verification: "/auth/verify-phone",
        profile_completion: "/complete-profile",
      };

      if (redirectMap[nextStep.type]) {
        toast.error(nextStep.message || "Please complete onboarding first", { icon: '📝'});
        router.push(redirectMap[nextStep.type]);
      }
    }
  }, [user, nextStep, router, authLoading, isInitialized]);

  // Enhanced Loading State
  if (loading || authLoading || !isInitialized) {
    return (
       <>
          <InteractiveBackground /> {/* Show background even during loading */}
          <LoaderComponent message="Checking Permissions..." />
       </>
    );
  }

  // Should not be reached if redirect works, but good fallback
  if (!user) return (
    <>
      <InteractiveBackground />
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Redirecting to login...</p>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen isolate overflow-hidden">
      <InteractiveBackground /> {/* Add the interactive background */}
      <div className="relative min-h-screen isolate overflow-hidden">
          <div className="container mx-auto px-4 py-12 sm:py-16 z-10 relative">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-violet-200/30 via-transparent to-transparent -z-10 blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-radial from-purple-200/30 via-transparent to-transparent -z-10 blur-3xl opacity-40 animate-pulse [animation-delay:0.5s]"></div>

            <div className="mb-10 text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent pb-2">
                  Launch Your Product
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Showcase your creation to a universe of builders and early adopters.
              </p>
            </div>

            <AddProductForm />
          </div>
       </div>
    </div>
  );
}