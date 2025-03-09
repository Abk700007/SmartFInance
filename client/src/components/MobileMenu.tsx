import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
  { name: "Income & Expenses", path: "/income-expenses", icon: "ri-wallet-3-line" },
  { name: "Budgets", path: "/budgets", icon: "ri-pie-chart-line" },
  { name: "Financial Advice", path: "/financial-advice", icon: "ri-bubble-chart-line" },
];

export default function MobileMenu({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [location] = useLocation();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
      <div className="w-64 h-full bg-white">
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <i className="ri-line-chart-fill text-2xl text-primary"></i>
            <h1 className="text-lg font-bold text-primary">SmartFinance</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a 
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg", 
                  location === item.path 
                    ? "bg-primary text-white" 
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
                onClick={onClose}
              >
                <i className={cn(item.icon, "mr-3 text-lg")}></i>
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <a href="#" className="flex items-center text-sm font-medium text-neutral-700">
            <i className="ri-user-line mr-3 text-lg"></i>
            <span>Demo User</span>
          </a>
        </div>
      </div>
    </div>
  );
}
