"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function ExploreLayout({ children }) {

    const pathname = usePathname();
    const router = useRouter();
    const isMainExplore = pathname === "/explore";

    return (
        <div className="min-h-screen pb-16">
            <div className="px-6 mx-auto max-w-7xl">
                {/* Back Button for nested routes */}
                {!isMainExplore && (
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/explore")}
                            className="gap-2 -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Explore
                        </Button>
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}

export default ExploreLayout