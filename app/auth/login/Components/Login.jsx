"use client";

import React from "react";
import LoginLeft from "./LoginLeft";
import AuthGravityAnimation from "../../(ui)/AuthGravityAnimation";
import guestOnly from "../../RouteProtector/guestOnly";

function Login() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Background Gravity Animation */}
      <div className="absolute inset-0 pointer-events-auto">
        <AuthGravityAnimation />
      </div>
      
      {/* Login Form */}
      <div className="relative z-10">
        <LoginLeft />
      </div>
    </div>
  );
}

export default guestOnly(Login);
