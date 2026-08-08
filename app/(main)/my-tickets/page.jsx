/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, Loader2, Ticket } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import EventCard from "@/components/EventCard";

function MyTicketsPage() {
    const [selectedTicket, setSelectedTicket] = useState(null);

    const { data: registrations, isLoading } = useConvexQuery(
        api.registrations.getMyRegistrations
    );

    const { mutate: cancelRegistration, isLoading: isCancelling } =
        useConvexMutation(api.registrations.cancelRegistration);

    const handleCancelRegistration = async (registrationId) => {
        if (!window.confirm("Are you sure you want to cancel this registration?"))
            return;

        try {
            await cancelRegistration({ registrationId });
            toast.success("Registration cancelled successfully.");
        } catch (error) {
            toast.error(error.message || "Failed to cancel registration");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    const now = Date.now();

    const upcomingTickets = registrations?.filter(
        (reg) =>
            reg.event && reg.event.endDate >= now && reg.status === "confirmed"
    );
    const pastTickets = registrations?.filter(
        (reg) =>
            reg.event && (reg.event.endDate < now || reg.status === "cancelled")
    );

    return (
        <div className="min-h-screen px-4 pb-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold">My Tickets</h1>
                    <p className="text-muted-foreground">
                        View and manage your event registrations
                    </p>
                </div>

                {/* Upcoming Tickets */}
                {upcomingTickets?.length > 0 && (
                    <div className="mb-12">
                        <h2 className="mb-4 text-2xl font-bold">Upcoming Events</h2>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingTickets.map((registration) => (
                                <EventCard
                                    key={registration._id}
                                    event={registration.event}
                                    action="ticket"
                                    onClick={() => setSelectedTicket(registration)}
                                    onDelete={() => handleCancelRegistration(registration._id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Tickets */}
                {pastTickets?.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold">Past Events</h2>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {pastTickets.map((registration) => (
                                <EventCard
                                    key={registration._id}
                                    event={registration.event}
                                    action={null}
                                    className="opacity-60"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!upcomingTickets?.length && !pastTickets?.length && (
                    <Card className="p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="mb-4 text-6xl">🎟️</div>
                            <h2 className="text-2xl font-bold">No tickets yet</h2>
                            <p className="text-muted-foreground">
                                Register for events to see your tickets here
                            </p>
                            <Button asChild className="gap-2">
                                <Link href="/explore">
                                    <Ticket className="w-4 h-4" /> Browse Events
                                </Link>
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* QR Code Modal */}
            {selectedTicket && (
                <Dialog
                    open={!!selectedTicket}
                    onOpenChange={() => setSelectedTicket(null)}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Your Ticket</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="mb-1 font-semibold">
                                    {selectedTicket.attendeeName}
                                </p>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {selectedTicket.event.title}
                                </p>
                            </div>

                            <div className="flex justify-center p-6 bg-white rounded-lg">
                                <QRCode value={selectedTicket.qrCode} size={200} level="H" />
                            </div>

                            <div className="text-center">
                                <p className="mb-1 text-xs text-muted-foreground">Ticket ID</p>
                                <p className="font-mono text-sm">{selectedTicket.qrCode}</p>
                            </div>

                            <div className="p-4 space-y-2 text-sm rounded-lg bg-muted">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {format(selectedTicket.event.startDate, "PPP, h:mm a")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {selectedTicket.event.locationType === "online"
                                            ? "Online Event"
                                            : `${selectedTicket.event.city}, ${selectedTicket.event.state ||
                                            selectedTicket.event.country
                                            }`}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                Show this QR code at the event entrance for check-in
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default MyTicketsPage;
