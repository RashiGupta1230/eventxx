"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function UnsplashImagePicker({ isOpen, onClose, onSelect }) {
    const [query, setQuery] = useState("event");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchImages = async (searchQuery) => {
        setLoading(true);
        try {
            const accessKey = typeof process !== "undefined" && process.env ? process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY : "";
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${accessKey}`
            );
            const data = await response.json();
            setImages(data.results || []);
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchImages(query);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Choose Cover Image</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for images..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </Button>
                </form>

                <div className="flex-1 px-6 -mx-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 py-4">
                            {images.map((image) => (
                                <button
                                    key={image.id}
                                    onClick={() => onSelect(image.urls.regular)}
                                    className="relative overflow-hidden transition-all border-2 border-transparent rounded-lg aspect-video hover:border-purple-500"
                                >
                                    <Image
                                        src={image.urls.small}
                                        alt={image.description || "Unsplash image"}
                                        className="object-cover w-full h-full"
                                        width={400}
                                        height={300}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && images.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            Search for images to get started
                        </div>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Photos from{" "}
                    <a
                        href="https://unsplash.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Unsplash
                    </a>
                </p>
            </DialogContent>
        </Dialog>
    );
}

export default UnsplashImagePicker;
