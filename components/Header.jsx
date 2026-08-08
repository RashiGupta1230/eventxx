'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { SignInButton, useAuth, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import { BarLoader } from 'react-spinners';
import { useStoreUser } from '@/hooks/use-store-user';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Building, Crown, Plus, Sparkles, Ticket } from "lucide-react";
import OnboardingModal from './onboarding-modal';
import { useOnboarding } from '@/hooks/use-onboarding';
import SearchLocationBar from './search-location-bar';
import { Badge } from './ui/badge';
import UpgradeModal from './upgrade-model';

function Header() {

    const { isLoading } = useStoreUser();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();

    const { has } = useAuth();
    const hasPro = has?.({ plan: 'pro' });

    return (
        <>
            <nav className='fixed top-0 left-0 right-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-md'>
                <div className='flex items-center justify-between px-4 sm:px-8 py-3.5 mx-auto max-w-7xl gap-4'>
                    {/* Logo */}
                    <Link href={'/'} className='flex items-center gap-2.5 group shrink-0'>
                        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 text-white font-bold text-lg shadow-sm">
                          X
                        </div>
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          EventX
                        </span>

                        {/* Pro Badge */}
                        {hasPro && (
                            <Badge className='gap-1 ml-2 text-white bg-gradient-to-r from-pink-500 to-orange-500 text-xs px-2 py-0.5'>
                                <Crown className='w-3 h-3' /> Pro
                            </Badge>
                        )}
                    </Link>

                    {/* Search & Location - Desktop only */}
                    <div className='justify-center flex-1 hidden md:flex max-w-md mx-4'>
                        <SearchLocationBar />
                    </div>

                    {/* Right Side Actions */}
                    <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
                        {!hasPro && (
                            <Button variant="ghost" size="sm" onClick={() => setShowUpgradeModal(true)} className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                                Pricing
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild className="relative font-semibold text-amber-600 hover:text-amber-700 text-sm after:content-[''] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-amber-500 after:rounded-full">
                            <Link href='/explore'>Explore</Link>
                        </Button>
                        <Authenticated>

                            {/* Create Event Button */}
                            <Button size="sm" asChild className="flex gap-1.5 ml-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium shadow-xs">
                                <Link href="/create-event">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Create Event</span>
                                </Link>
                            </Button>

                            {/* User Button */}
                            <div className="ml-2">
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-9 h-9",
                                        },
                                    }}
                                >
                                    <UserButton.MenuItems>
                                        <UserButton.Link
                                            label="My Tickets"
                                            labelIcon={<Ticket size={16} />}
                                            href="/my-tickets"
                                        />
                                        <UserButton.Link
                                            label="My Events"
                                            labelIcon={<Building size={16} />}
                                            href="/my-events"
                                        />
                                        <UserButton.Action label="manageAccount" />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        </Authenticated>
                        <Unauthenticated>
                            <SignInButton mode='modal'>
                                <Button size='sm' className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 font-semibold text-xs sm:text-sm">
                                    Sign In
                                </Button>
                            </SignInButton>
                        </Unauthenticated>
                    </div>
                </div>

                {/* Mobile Search & Location - Below Header */}
                <div className='px-3 py-3 border-t md:hidden'>
                    <SearchLocationBar />
                </div>

                {/* Loader */}
                {isLoading && (
                    <div className='absolute bottom-0 left-0 w-full'>
                        <BarLoader width={'100%'} color='#a855f7' />
                    </div>
                )}
            </nav>

            {/* Modals */}
            <OnboardingModal
                isOpen={showOnboarding}
                onClose={handleOnboardingSkip}
                onComplete={handleOnboardingComplete}
            />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                trigger='header'
            />
        </>
    )
}

export default Header
