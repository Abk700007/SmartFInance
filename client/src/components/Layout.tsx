import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (desktop) */}
      <Sidebar />
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <i className="ri-line-chart-fill text-2xl text-primary"></i>
            <h1 className="text-lg font-bold text-primary">SmartFinance</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-neutral-100">
        {children}
      </main>
    </div>
  );
}
