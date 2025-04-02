"use client";

import { Inter } from "next/font/google";
import { AuthProvider } from "../../../Contexts/Auth/AuthContext.js";

const inter = Inter({ subsets: ["latin"] });

export default function LoginLayout({ children }) {
  return (
    <div>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
