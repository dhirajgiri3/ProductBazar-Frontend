"use client";
import React from "react";
import RegisterLeft from "./RegisterLeft";
import AuthRight from "../../Common/AuthRight";
import guestOnly from "../../RouteProtector/guestOnly";
import { motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";

function Register() {
  return (
    <div className="min-h-screen h-full py-8 bg-gray-50 relative overflow-hidden flex items-center justify-center">
      {/* Animated background with improved visuals */}
      <AnimatedBackground />

      {/* Main layout container with responsive grid */}
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 relative z-10 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto w-full">
          {/* Left column - Registration form */}
          <motion.div
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <RegisterLeft />
          </motion.div>

          {/* Right column - Branding/Welcome area */}
          <motion.div
            className="w-full hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <div className="rounded-3xl p-8 md:p-10 bg-white/30 backdrop-blur-md border border-violet-600/10">
              <AuthRight
                title={
                  <>
                    Join{" "}
                    <span className="text-violet-600 font-bold">
                      Product Bazar
                    </span>{" "}
                    Today
                  </>
                }
                description="Sign up to unlock exclusive features tailored to your role – connect, create, and grow with our community of makers and enthusiasts."
                showAnimation={true}
              />
            </div>
          </motion.div>
        </div>

        {/* Mobile-only branding message */}
        <motion.div
          className="lg:hidden text-center mt-8 text-gray-600 absolute bottom-6 left-0 right-0 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-sm bg-white/50 backdrop-blur-sm py-3 px-4 rounded-xl shadow-sm mx-auto max-w-md">
            Join{" "}
            <span className="text-violet-600 font-semibold">Product Bazar</span>{" "}
            today and connect with innovative creators worldwide.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default guestOnly(Register);
