"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City } from "country-state-city";
import { CalendarIcon, Loader2, Sparkles, ImagePlus, MapPin, Calendar as CalendarLucide, Tag, Ticket, Users } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UpgradeModal from "@/components/upgrade-model";
import UnsplashImagePicker from "@/components/unsplash-image-picker";
import AIEventCreator from "./_components/ai-event-creator";
import { CATEGORIES } from "@/lib/data";
import Image from "next/image";

// HH:MM in 24h
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Please select a category"),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
    startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
    endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
    locationType: z.enum(["physical", "online"]).default("physical"),
    venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    address: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    ticketType: z.enum(["free", "paid"]).default("free"),
    ticketPrice: z.number().optional(),
    coverImage: z.string().optional(),
    themeColor: z.string().default("#2563eb"),
});

function CreateEventPage() {
    const router = useRouter();
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState("limit");

    const { has } = useAuth();
    const hasPro = has?.({ plan: "pro" });

    const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
    const { mutate: createEvent, isLoading } = useConvexMutation(
        api.events.createEvent
    );

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            locationType: "physical",
            ticketType: "free",
            capacity: 50,
            themeColor: "#2563eb",
            category: "",
            state: "",
            city: "",
            startTime: "",
            endTime: "",
        },
    });

    const themeColor = watch("themeColor");
    const ticketType = watch("ticketType");
    const selectedState = watch("state");
    const startDate = watch("startDate");
    const endDate = watch("endDate");
    const coverImage = watch("coverImage");

    const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);
    const cities = useMemo(() => {
        if (!selectedState) return [];
        const st = indianStates.find((s) => s.name === selectedState);
        if (!st) return [];
        return City.getCitiesOfState("IN", st.isoCode);
    }, [selectedState, indianStates]);

    const colorPresets = [
        "#2563eb", // Royal Blue
        ...(hasPro ? ["#0284c7", "#1d4ed8", "#0369a1", "#3b82f6", "#0d9488"] : []),
    ];

    const handleColorClick = (color) => {
        if (color !== "#2563eb" && !hasPro) {
            setUpgradeReason("color");
            setShowUpgradeModal(true);
            return;
        }
        setValue("themeColor", color);
    };

    const combineDateTime = (date, time) => {
        if (!date || !time) return null;
        const [hh, mm] = time.split(":").map(Number);
        const d = new Date(date);
        d.setHours(hh, mm, 0, 0);
        return d;
    };

    const onSubmit = async (data) => {
        try {
            const start = combineDateTime(data.startDate, data.startTime);
            const end = combineDateTime(data.endDate, data.endTime);

            if (!start || !end) {
                toast.error("Please select both date and time for start and end.");
                return;
            }
            if (end.getTime() <= start.getTime()) {
                toast.error("End date/time must be after start date/time.");
                return;
            }

            if (!hasPro && currentUser?.freeEventCreated >= 1) {
                setUpgradeReason("limit");
                setShowUpgradeModal(true);
                return;
            }

            if (data.themeColor !== "#2563eb" && !hasPro) {
                setUpgradeReason("color");
                setShowUpgradeModal(true);
                return;
            }

            await createEvent({
                title: data.title,
                description: data.description,
                category: data.category,
                tags: [data.category],
                startDate: start.getTime(),
                endDate: end.getTime(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                locationType: data.locationType,
                venue: data.venue || undefined,
                address: data.address || undefined,
                city: data.city,
                state: data.state || undefined,
                country: "India",
                capacity: data.capacity,
                ticketType: data.ticketType,
                ticketPrice: data.ticketPrice || undefined,
                coverImage: data.coverImage || undefined,
                themeColor: data.themeColor,
                hasPro,
            });

            toast.success("Event created successfully! 🎉");
            router.push("/my-events");
        } catch (error) {
            toast.error(error.message || "Failed to create event");
        }
    };

    const handleAIGenerate = (generatedData) => {
        const options = { shouldValidate: true, shouldDirty: true };
        setValue("title", generatedData.title || "", options);
        setValue("description", generatedData.description || "", options);
        setValue("category", generatedData.category?.toLowerCase() || "", options);
        setValue("capacity", generatedData.suggestedCapacity || 50, options);
        setValue("ticketType", generatedData.suggestedTicketType?.toLowerCase() || "free", options);
        toast.success("Event details filled automatically! Customize as needed.");
    };

    return (
        <div className="min-h-screen pb-16">
            {/* Header Banner */}
            <div className="relative p-8 md:p-10 mb-10 rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl overflow-hidden border border-blue-700/40">
                <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-3xl pointer-events-none -z-0" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                            Event Studio
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">Create New Event</h1>
                        <p className="mt-1 text-blue-200/90 text-sm max-w-md">
                            Publish your event with digital tickets, live QR entry, and AI assistance.
                        </p>
                        {!hasPro && (
                            <div className="mt-3 inline-block">
                                <Badge className="bg-blue-950/80 text-blue-200 border border-blue-700/60 text-xs px-3 py-1">
                                    Free Plan: {currentUser?.freeEventCreated || 0}/1 events created
                                </Badge>
                            </div>
                        )}
                    </div>
                    <AIEventCreator onEventGenerated={handleAIGenerate} />
                </div>
            </div>

            {/* Main Form Grid */}
            <div className="grid md:grid-cols-[320px_1fr] gap-8">
                {/* LEFT COLUMN: Cover Image & Theme Accent */}
                <div className="space-y-6">
                    {/* Cover Picker Box */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                        <Label className="text-slate-900 font-semibold text-base block">Cover Image</Label>
                        <div
                            className="group relative flex flex-col items-center justify-center w-full overflow-hidden border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 cursor-pointer aspect-square rounded-2xl transition-all duration-200"
                            onClick={() => setShowImagePicker(true)}
                        >
                            {coverImage ? (
                                <>
                                    <Image
                                        src={coverImage}
                                        alt="Cover"
                                        className="object-cover w-full h-full rounded-2xl"
                                        width={500}
                                        height={500}
                                        sizes="320px"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">
                                        Change Cover
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                                        <ImagePlus className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800 block mb-1">Upload Cover</span>
                                    <span className="text-xs text-slate-500">Search high-res Unsplash photos</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Theme Color Selector */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-slate-900 font-semibold text-sm">Theme Accent</Label>
                            {!hasPro && (
                                <Badge variant="secondary" className="gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                    <Sparkles className="w-3 h-3 text-blue-600" />
                                    Pro Custom
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2.5 pt-1">
                            {colorPresets.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`w-9 h-9 rounded-xl border-2 transition-all shadow-sm ${!hasPro && color !== "#2563eb"
                                            ? "opacity-40 cursor-not-allowed"
                                            : "hover:scale-110"
                                        }`}
                                    style={{
                                        backgroundColor: color,
                                        borderColor: themeColor === color ? "#1e40af" : "transparent",
                                        boxShadow: themeColor === color ? "0 0 0 2px #93c5fd" : "none",
                                    }}
                                    onClick={() => handleColorClick(color)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Event Details Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
                    {/* Event Title */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-sm">Event Name *</Label>
                        <Input
                            {...register("title")}
                            placeholder="e.g. Annual Tech Summit 2026"
                            className="text-xl sm:text-2xl font-bold bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-200 h-14 rounded-2xl"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                        {/* Start Date & Time */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                                <CalendarLucide className="w-4 h-4 text-blue-600" /> Start Date &amp; Time *
                            </Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="justify-between w-full h-11 bg-slate-50 border-slate-200 text-slate-800 font-medium rounded-xl hover:bg-white hover:border-blue-400"
                                        >
                                            {startDate ? format(startDate, "PPP") : "Pick date"}
                                            <CalendarIcon className="w-4 h-4 text-blue-600 ml-2" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(date) => setValue("startDate", date)}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    {...register("startTime")}
                                    className="h-11 w-28 bg-slate-50 border-slate-200 text-slate-800 rounded-xl"
                                />
                            </div>
                            {(errors.startDate || errors.startTime) && (
                                <p className="text-xs text-red-500">
                                    {errors.startDate?.message || errors.startTime?.message}
                                </p>
                            )}
                        </div>

                        {/* End Date & Time */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                                <CalendarLucide className="w-4 h-4 text-blue-600" /> End Date &amp; Time *
                            </Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="justify-between w-full h-11 bg-slate-50 border-slate-200 text-slate-800 font-medium rounded-xl hover:bg-white hover:border-blue-400"
                                        >
                                            {endDate ? format(endDate, "PPP") : "Pick date"}
                                            <CalendarIcon className="w-4 h-4 text-blue-600 ml-2" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={(date) => setValue("endDate", date)}
                                            disabled={(date) => date < (startDate || new Date())}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    {...register("endTime")}
                                    className="h-11 w-28 bg-slate-50 border-slate-200 text-slate-800 rounded-xl"
                                />
                            </div>
                            {(errors.endDate || errors.endTime) && (
                                <p className="text-xs text-red-500">
                                    {errors.endDate?.message || errors.endTime?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                            <Tag className="w-4 h-4 text-blue-600" /> Category *
                        </Label>
                        <Controller
                            control={control}
                            name="category"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl">
                                        <SelectValue placeholder="Select event category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && (
                            <p className="text-xs text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Location & Venue */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-600" /> Location &amp; Venue *
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                control={control}
                                name="state"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue("city", "");
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl">
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {indianStates.map((s) => (
                                                <SelectItem key={s.isoCode} value={s.name}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            <Controller
                                control={control}
                                name="city"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!selectedState}
                                    >
                                        <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl">
                                            <SelectValue
                                                placeholder={
                                                    selectedState ? "Select city" : "Select state first"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((c) => (
                                                <SelectItem key={c.name} value={c.name}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Input
                                {...register("venue")}
                                placeholder="Venue Map Link (Google Maps URL)"
                                type="url"
                                className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl"
                            />
                            {errors.venue && (
                                <p className="text-xs text-red-500">{errors.venue.message}</p>
                            )}

                            <Input
                                {...register("address")}
                                placeholder="Full address / street / building (optional)"
                                className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <Label className="text-slate-700 font-semibold text-sm">Description *</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Describe what attendees will experience, schedule details, speakers..."
                            rows={4}
                            className="bg-slate-50 border-slate-200 text-slate-800 rounded-2xl p-4 focus:bg-white focus:border-blue-500 focus:ring-blue-200"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Ticketing & Capacity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                        {/* Ticket Type */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                                <Ticket className="w-4 h-4 text-blue-600" /> Ticket Pricing
                            </Label>
                            <div className="flex items-center gap-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-sm font-medium">
                                    <input
                                        type="radio"
                                        value="free"
                                        {...register("ticketType")}
                                        className="text-blue-600 focus:ring-blue-500"
                                        defaultChecked
                                    />{" "}
                                    Free Ticket
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-slate-800 text-sm font-medium">
                                    <input
                                        type="radio"
                                        value="paid"
                                        {...register("ticketType")}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />{" "}
                                    Paid Ticket
                                </label>
                            </div>
                            {ticketType === "paid" && (
                                <Input
                                    type="number"
                                    placeholder="Ticket price ₹"
                                    {...register("ticketPrice", { valueAsNumber: true })}
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl"
                                />
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-blue-600" /> Attendee Capacity *
                            </Label>
                            <Input
                                type="number"
                                {...register("capacity", { valueAsNumber: true })}
                                placeholder="e.g. 100"
                                className="h-11 bg-slate-50 border-slate-200 text-slate-800 rounded-xl"
                            />
                            {errors.capacity && (
                                <p className="text-xs text-red-500">{errors.capacity.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Event...
                            </>
                        ) : (
                            "Publish Event"
                        )}
                    </Button>
                </form>
            </div>

            {/* Unsplash Picker */}
            {showImagePicker && (
                <UnsplashImagePicker
                    isOpen={showImagePicker}
                    onClose={() => setShowImagePicker(false)}
                    onSelect={(url) => {
                        setValue("coverImage", url);
                        setShowImagePicker(false);
                    }}
                />
            )}

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                trigger={upgradeReason}
            />
        </div>
    );
}

export default CreateEventPage;
