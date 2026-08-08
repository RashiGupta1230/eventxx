'use client';

import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-convex-query';
import React, { useMemo } from 'react'
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Calendar, MapPin, Users, ArrowRight, Loader2, Badge } from "lucide-react";
import Image from 'next/image';
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { createLocationSlug } from '@/lib/location-utils';
import EventCard from '@/components/EventCard';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/data';

function ExplorePage() {

    const router = useRouter();
    const autoplay = useMemo(
        () => Autoplay({ delay: 2000, stopOnInteraction: true }),
        []
    );

    // Fetch current user for location
    const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

    // Fetch events
    const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(
        api.explore.getFeaturedEvents,
        { limit: 3 }
    );

    const { data: localEvents, isLoading: loadingLocal } = useConvexQuery(
        api.explore.getEventsByLocation,
        {
            city: currentUser?.location?.city || "Gurugram",
            state: currentUser?.location?.state || "Haryana",
            limit: 4,
        }
    );

    const { data: popularEvents, isLoading: loadingPopular } = useConvexQuery(
        api.explore.getPopularEvents,
        { limit: 6 }
    );

    const { data: categoryCounts } = useConvexQuery(
        api.explore.getCategoryCounts
    );

    const handleEventClick = (slug) => {
        router.push(`/events/${slug}`);
    };

    const handleCategoryClick = (categoryId) => {
        router.push(`/explore/${categoryId}`);
    };

    const handleViewLocalEvents = () => {
        const city = currentUser?.location?.city || "Gurugram";
        const state = currentUser?.location?.state || "Haryana";
        const slug = createLocationSlug(city, state);
        router.push(`/explore/${slug}`);
    };

    // Format categories with counts
    const categoriesWithCounts = CATEGORIES.map((cat) => ({
        ...cat,
        count: categoryCounts?.[cat.id] || 0,
    }));

    // Loading state
    const isLoading = loadingFeatured || loadingLocal || loadingPopular;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Hero Title */}
            <div className="pb-12 text-center">
                <h1 className="mb-4 text-5xl font-bold md:text-6xl">Discover Events</h1>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                    Explore featured events, find what&apos;s happening locally, or browse
                    events across India
                </p>
            </div>

            {/* Featured Carousel */}
            {featuredEvents && featuredEvents.length > 0 && (
                <div className="mb-16">
                    <Carousel
                        plugins={[autoplay]}
                        className="w-full"
                        onMouseEnter={() => autoplay.stop()}
                        onMouseLeave={() => autoplay.reset()}
                    >
                        <CarouselContent>
                            {featuredEvents.map((event, index) => (
                                <CarouselItem key={event._id}>
                                    <div
                                        className="relative overflow-hidden cursor-pointer h-100 rounded-xl"
                                        onClick={() => handleEventClick(event.slug)}
                                    >
                                        {event.coverImage ? (
                                            <Image
                                                src={event.coverImage}
                                                alt={event.title}
                                                fill
                                                className="object-cover"
                                                sizes="100vw"
                                                preload={index === 0}
                                            />
                                        ) : (
                                            <div
                                                className="absolute inset-0"
                                                style={{ backgroundColor: event.themeColor }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
                                        <div className="relative flex flex-col justify-end h-full p-8 md:p-12">
                                            <Badge className="mb-4 w-fit" variant="secondary">
                                                {event.city}, {event.state || event.country}
                                            </Badge>
                                            <h2 className="mb-3 text-3xl font-bold text-white md:text-5xl">
                                                {event.title}
                                            </h2>
                                            <p className="max-w-2xl mb-4 text-lg text-white/90 line-clamp-2">
                                                {event.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-white/80">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {format(event.startDate, "PPP")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm">{event.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {event.registrationCount} registered
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                </div>
            )}

            {/* Local Events */}
            {localEvents && localEvents.length > 0 && (
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="mb-1 text-3xl font-bold">Events Near You</h2>
                            <p className="text-muted-foreground">
                                Happening in {currentUser?.location?.city || "your area"}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleViewLocalEvents}
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {localEvents.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                variant="compact"
                                onClick={() => handleEventClick(event.slug)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Browse by Category */}
            <div className="mb-16">
                <h2 className="mb-6 text-3xl font-bold">Browse by Category</h2>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                    {categoriesWithCounts.map((category) => (
                        <Card
                            key={category.id}
                            className="py-2 transition-all cursor-pointer group hover:shadow-lg hover:border-purple-500/50"
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <CardContent className="flex items-center gap-3 px-3 sm:p-6">
                                <div className="text-3xl sm:text-4xl">{category.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="mb-1 font-semibold transition-colors group-hover:text-purple-400">
                                        {category.label}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {category.count} Event{category.count !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Popular Events Across Country */}
            {popularEvents && popularEvents.length > 0 && (
                <div className="mb-16">
                    <div className="mb-6">
                        <h2 className="mb-1 text-3xl font-bold">Popular Across India</h2>
                        <p className="text-muted-foreground">Trending events nationwide</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {popularEvents.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                variant="list"
                                onClick={() => handleEventClick(event.slug)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loadingFeatured &&
                !loadingLocal &&
                !loadingPopular &&
                (!featuredEvents || featuredEvents.length === 0) &&
                (!localEvents || localEvents.length === 0) &&
                (!popularEvents || popularEvents.length === 0) && (
                    <Card className="p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="mb-4 text-6xl">🎉</div>
                            <h2 className="text-2xl font-bold">No events yet</h2>
                            <p className="text-muted-foreground">
                                Be the first to create an event in your area!
                            </p>
                            <Button asChild className="gap-2">
                                <a href="/create-event">Create Event</a>
                            </Button>
                        </div>
                    </Card>
                )}
        </>
    )
}

export default ExplorePage
