"use client";

import React, { useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export function ConvexClientProvider({ children }) {
    const client = useMemo(() => {
        const url = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";
        return new ConvexReactClient(url);
    }, []);

    return (
        <ConvexProviderWithClerk client={client} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}