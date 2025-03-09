import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
  { name: "Income & Expenses", path: "/income-expenses", icon: "ri-wallet-3-line" },
  { name: "Budgets", path: "/budgets", icon: "ri-pie-chart-line" },
  { name: "Financial Advice", path: "/financial-advice", icon: "ri-bubble-chart-line" },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-neutral-200 shadow-sm z-20">
      <div className="flex items-center justify-center h-16 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <i className="ri-line-chart-fill text-2xl text-primary"></i>
          <h1 className="text-lg font-bold text-primary">SmartFinance</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-lg", 
              location === item.path 
                ? "bg-primary text-white" 
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            <i className={cn(item.icon, "mr-3 text-lg")}></i>
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <a href="#" className="flex items-center text-sm font-medium text-neutral-700">
          <i className="ri-user-line mr-3 text-lg"></i>
          <span>Demo User</span>
        </a>
      </div>
    </aside>
  );
}
