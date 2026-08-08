"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

function AIEventCreator({ onEventGenerated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const generateEvent = async () => {
        if (!prompt.trim()) {
            toast.error("Please describe your event");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/generate-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            onEventGenerated(data);
            toast.success("Event details generated! Review and customize below.");
            setIsOpen(false);
            setPrompt("");
        } catch (error) {
            toast.error("Failed to generate event. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-white text-slate-800 hover:bg-slate-50 font-bold border border-slate-200 shadow-xs rounded-xl transition-all hover:scale-105 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100" />
                    Auto-Fill Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border border-slate-200 rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        Smart Event Assistant
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Describe your event idea in plain text to automatically draft title, description &amp; suggested capacity for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Example: A developer meetup about Next.js and web tools in Bangalore. It should cover modern server actions and live demos..."
                        rows={5}
                        className="bg-slate-50 border-slate-200 text-slate-800 rounded-2xl p-4 focus:bg-white focus:border-amber-500 focus:ring-amber-200 resize-none"
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 rounded-xl border-slate-200 text-slate-700 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={generateEvent}
                            disabled={loading || !prompt.trim()}
                            className="flex-1 gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xs cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Drafting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Draft Details
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AIEventCreator;
