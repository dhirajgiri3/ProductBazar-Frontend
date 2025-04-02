// file: frontend/app/dashboard/[productId]/page.jsx

"use client";

import React from "react";
import Dashboard from "./Components/Dashboard";
import { useParams } from "next/navigation";
import UserViewHistory from "../../../../Components/View/UserViewHistory";

function page() {
    const { productId } = useParams();
    console.log("Product ID:", productId);
    return (
        <>
            <Dashboard productId={productId} />
            <UserViewHistory />
        </>
    );
}

export default page;
