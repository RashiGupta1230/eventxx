"use client";

import { Sparkles, Check, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function UpgradeModal({ isOpen, onClose, trigger = "limit" }) {
    const proFeatures = [
        "Unlimited Event Creation",
        "AI-Powered Title & Description Generator",
        "Custom Event Theme Colors & Palettes",
        "Advanced Analytics & Revenue Tracking",
        "CSV Attendee Exporting",
        "Priority Customer Support",
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader className="text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Upgrade to Pro</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500">
                        {trigger === "header" && "Create Unlimited Events with Pro!"}
                        {trigger === "limit" && "You've reached your free event limit."}
                        {trigger === "color" && "Custom theme colors are a Pro feature."}
                        {" "}Unlock full AI features and unlimited event capacity.
                    </DialogDescription>
                </DialogHeader>

                {/* Pro Pricing Card */}
                <div className="relative p-6 mt-2 rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white shadow-xl overflow-hidden border border-violet-800/40">
                    <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 px-3 py-1 font-semibold">
                            <Zap className="w-3 h-3 mr-1 fill-white" /> Popular
                        </Badge>
                    </div>

                    <div className="mb-4">
                        <div className="text-sm font-medium text-violet-300">Pro Plan</div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-extrabold tracking-tight">$19</span>
                            <span className="text-slate-400 text-sm">/ month</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 mb-6 text-sm">
                        {proFeatures.map((feature) => (
                            <div key={feature} className="flex items-center gap-2.5">
                                <div className="p-0.5 rounded-full bg-violet-500/20 text-violet-400">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-slate-200">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <Button
                        size="lg"
                        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-900/50 transition-all hover:scale-[1.02]"
                        onClick={() => {
                            // Link to Stripe / Clerk billing portal
                            window.open("https://dashboard.clerk.com", "_blank");
                        }}
                    >
                        Upgrade Now
                    </Button>
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} className="w-full text-slate-500 hover:text-slate-700">
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default UpgradeModal;
