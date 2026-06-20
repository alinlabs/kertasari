import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export function Layout({ children, activeTab }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center">
      <Header activeTab={activeTab} />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 w-full">
        {children}
      </main>

      <div className="w-full">
        <Footer />
      </div>

      <MobileNav activeTab={activeTab} />
    </div>
  );
}
