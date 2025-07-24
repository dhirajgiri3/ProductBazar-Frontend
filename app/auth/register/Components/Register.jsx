"use client";
import React from "react";
import RegisterLeft from "./RegisterLeft";
import AuthGravityAnimation from "../../(ui)/AuthGravityAnimation";
import guestOnly from "../../RouteProtector/guestOnly";

function Register() {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Background Gravity Animation */}
      <div className="absolute inset-0 opacity-40 pointer-events-auto">
        <AuthGravityAnimation />
      </div>
      
      {/* Register Form */}
      <div className="relative z-10">
        <RegisterLeft />
      </div>
    </div>
  );
}

export default guestOnly(Register);
