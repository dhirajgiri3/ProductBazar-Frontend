// File: frontend/app/product/viewanalytics/[productId]/Components/Dashboard.jsx

"use client";

import React from "react";
import withAuth from "../../../../auth/RouteProtector/withAuth";
import ViewsAnalyticsDashboard from "../../../../../Components/View/ViewsAnalyticsDashboard";

function Dashboard({ productId }) {
  if (!productId) {
    return <div className="text-red-500">No Product ID provided.</div>;
  }

  return (
    <div>
      <ViewsAnalyticsDashboard productId={productId} />
    </div>
  );
}

export default withAuth(Dashboard);
