import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, MapPin, Users, Sparkles, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Events Created", value: "10K+", icon: Calendar },
    { label: "Cities Covered", value: "200+", icon: MapPin },
    { label: "Happy Attendees", value: "50K+", icon: Users },
  ];

  const features = [
    {
      icon: "🎨",
      title: "Beautiful Event Pages",
      description: "Craft stunning event pages with custom themes, cover images, and branding in minutes.",
    },
    {
      icon: "🤖",
      title: "AI-Powered Creation",
      description: "Let AI generate your event title, description, and capacity recommendations instantly.",
    },
    {
      icon: "📱",
      title: "Instant QR Tickets",
      description: "Attendees receive digital tickets with unique QR codes the moment they register.",
    },
    {
      icon: "⚡",
      title: "Real-Time Check-In",
      description: "Scan QR codes at the door with any camera — zero setup, zero friction.",
    },
    {
      icon: "📊",
      title: "Live Analytics",
      description: "Track registrations, check-in rates, and revenue in real time from your dashboard.",
    },
    {
      icon: "🌍",
      title: "Discover Locally",
      description: "Find events happening near you filtered by category, city, or interest.",
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative text-center pt-10 pb-20 max-w-4xl mx-auto">
        {/* Soft background ambient light gradients (warm gold right, soft teal left) */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl opacity-70" />
          <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-3xl opacity-80" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-slate-900">
          Discover &amp; create{" "}
          <br />
          <span className="text-amber-600 bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
            amazing events.
          </span>
        </h1>

        <p className="max-w-xl mx-auto mb-10 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Whether you&apos;re hosting or attending, EventX makes every event
          memorable. Join thousands of organizers building communities.
        </p>

        <div className="flex flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full px-7 py-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm sm:text-base shadow-md shadow-amber-200 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <Link href="/explore">
              Explore Events <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-7 py-6 border border-slate-200/90 text-slate-800 bg-white/90 hover:bg-slate-50 font-semibold text-sm sm:text-base shadow-2xs transition-all cursor-pointer"
          >
            <Link href="/create-event">
              Create an Event
            </Link>
          </Button>
        </div>

        {/* Stats floating cards */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-16 max-w-3xl mx-auto">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3.5 px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow min-w-[200px] w-full sm:w-auto"
            >
              <div className="p-2.5 rounded-full bg-amber-50 text-amber-600 shrink-0">
                <Icon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-extrabold text-slate-900 leading-none mb-1">{value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-4 h-4 text-amber-500" />
            Everything you need
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Built for modern event organizers
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            From AI-assisted creation to real-time check-ins — EventX covers
            the entire event lifecycle in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-12 text-center text-white shadow-xl">
        <div className="absolute inset-0 -z-0 pointer-events-none opacity-25">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute bottom-4 left-8 w-40 h-40 rounded-full bg-yellow-400/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to host your next event?
          </h2>
          <p className="text-slate-300 mb-8 max-w-md mx-auto">
            Get started for free — no credit card required. Upgrade to Pro anytime for unlimited events.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-10 py-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Link href="/create-event">
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
