"use client";

import React, { useEffect, memo } from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRouter } from "next/navigation";

const withAdmin = (Component) => {
  const AdminProtectedComponent = memo((props) => {
    const { user, authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (authLoading) return;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (user.role !== "admin") {
        router.push("/unauthorized");
      }
    }, [authLoading, user, router]);

    // Only render when we're sure it's an admin
    if (authLoading || !user || user.role !== "admin") return null;

    return <Component {...props} />;
  });

  // Preserve the original component's display name for debugging
  const componentName = Component.displayName || Component.name || "Component";
  AdminProtectedComponent.displayName = `withAdmin(${componentName})`;

  return AdminProtectedComponent;
};

export default withAdmin;
