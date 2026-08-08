/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Loader2 } from "lucide-react";
import { State, City } from "country-state-city";
import { format } from "date-fns";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import { getCategoryIcon } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function SearchLocationBar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    const { data: currentUser, isLoading } = useConvexQuery(
        api.users.getCurrentUser
    );
    const { mutate: updateLocation } = useConvexMutation(
        api.users.completeOnboarding
    );

    const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
        api.search.searchEvents,
        searchQuery.trim().length >= 2 ? { query: searchQuery, limit: 5 } : "skip"
    );

    const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    useEffect(() => {
        if (currentUser?.location) {
            setSelectedState(currentUser.location.state || "");
            setSelectedCity(currentUser.location.city || "");
        }
    }, [currentUser, isLoading]);

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const cities = useMemo(() => {
        if (!selectedState) return [];
        const state = indianStates.find((s) => s.name === selectedState);
        if (!state) return [];
        return City.getCitiesOfState("IN", state.isoCode);
    }, [selectedState, indianStates]);

    const debouncedSetQuery = useRef(
        debounce((value) => setSearchQuery(value), 300)
    ).current;

    const handleSearchInput = (e) => {
        const value = e.target.value;
        debouncedSetQuery(value);
        setShowSearchResults(value.length >= 2);
    };

    const handleEventClick = (slug) => {
        setShowSearchResults(false);
        setSearchQuery("");
        router.push(`/events/${slug}`);
    };

    const handleLocationSelect = async (city, state) => {
        try {
            if (currentUser?.interests && currentUser?.location) {
                await updateLocation({
                    location: { city, state, country: "India" },
                    interests: currentUser.interests,
                });
            }
            const slug = createLocationSlug(city, state);
            router.push(`/explore/${slug}`);
        } catch (error) {
            console.error("Failed to update location:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center bg-slate-100/70 hover:bg-slate-100 transition-colors border border-slate-200/80 rounded-full px-2 py-1 shadow-xs focus-within:ring-2 focus-within:ring-amber-500/20 max-w-lg w-full">
            {/* Search Bar */}
            <div className="relative flex-1 flex items-center min-w-0" ref={searchRef}>
                <Search className="w-4 h-4 ml-2 mr-1.5 text-slate-400 shrink-0" />
                <Input
                    placeholder="Search events..."
                    onChange={handleSearchInput}
                    onFocus={() => {
                        if (searchQuery.length >= 2) setShowSearchResults(true);
                    }}
                    className="w-full h-8 bg-transparent border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm px-1 placeholder:text-slate-400 text-slate-800"
                />

                {/* Search Results */}
                {showSearchResults && (
                    <div className="absolute top-full left-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
                        {searchLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                            </div>
                        ) : searchResults && searchResults.length > 0 ? (
                            <div className="py-2">
                                <p className="px-4 py-2 text-xs font-semibold text-slate-400 tracking-wider">
                                    SEARCH RESULTS
                                </p>
                                {searchResults.map((event) => (
                                    <button
                                        key={event._id}
                                        onClick={() => handleEventClick(event.slug)}
                                        className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl mt-0.5">
                                                {getCategoryIcon(event.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="mb-1 font-medium line-clamp-1 text-slate-900 text-sm">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(event.startDate, "MMM dd")}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {event.city}
                                                    </span>
                                                </div>
                                            </div>
                                            {event.ticketType === "free" && (
                                                <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    Free
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <div className="h-4 w-px bg-slate-200 shrink-0 mx-1" />

            {/* State Select */}
            <Select
                value={selectedState}
                onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity("");
                }}
            >
                <SelectTrigger className="w-24 sm:w-28 h-8 border-0 shadow-none bg-transparent text-xs text-slate-600 focus:ring-0 px-2 font-medium">
                    <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                    {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name} className="text-xs">
                            {state.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="h-4 w-px bg-slate-200 shrink-0 mx-1" />

            {/* City Select */}
            <Select
                value={selectedCity}
                onValueChange={(value) => {
                    setSelectedCity(value);
                    if (value && selectedState) {
                        handleLocationSelect(value, selectedState);
                    }
                }}
                disabled={!selectedState}
            >
                <SelectTrigger className="w-24 sm:w-28 h-8 border-0 shadow-none bg-transparent text-xs text-slate-600 focus:ring-0 px-2 font-medium">
                    <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                    {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name} className="text-xs">
                            {city.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}