import { ConvexClientProvider } from "@/components/convex-client-provider";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from '@clerk/ui/themes';
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "EventX - Delightful Events Start Here",
  description: "Discover and create amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen bg-slate-50 text-slate-900 font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header */}
          <ClerkProvider appearance={{
            theme: shadcn,
          }}>
            <ConvexClientProvider>
              <Header />
              <main className="container relative min-h-screen pt-32 sm:pt-36 md:pt-40 mx-auto px-4 sm:px-6">
                {/* Soft Ambient Light Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                  <div className="absolute top-10 rounded-full left-1/4 h-96 bg-violet-200/40 blur-3xl w-96" />
                  <div className="absolute bottom-10 rounded-full right-1/4 h-96 bg-pink-200/30 blur-3xl w-96" />
                </div>
                <div className="relative z-10 min-h-[70vh]">{children}</div>
                {/* Footer */}
                <footer className="px-6 py-8 mx-auto mt-20 border-t border-slate-200/70 max-w-7xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                      EventX
                    </div>
                    <div className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
                      <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                      <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                      <a href="#" className="hover:text-slate-900 transition-colors">Contact Support</a>
                      <a href="#" className="hover:text-slate-900 transition-colors">Blog</a>
                    </div>
                    <div className="text-xs text-slate-400 font-normal">
                      © 2024 EventX AI. All rights reserved.
                    </div>
                  </div>
                </footer>
                <Toaster />
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
