import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import IncomeExpenses from "@/pages/IncomeExpenses";
import Budgets from "@/pages/Budgets";
import FinancialAdvice from "@/pages/FinancialAdvice";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";

// Simple authentication state
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for demo
  
  // In a real app, this would check for a token in localStorage or cookies
  useEffect(() => {
    // For demo purposes, we're keeping everyone authenticated
    setIsAuthenticated(true);
  }, []);
  
  return { isAuthenticated, setIsAuthenticated };
};

function Router() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if current route is auth route
  const isAuthRoute = location === "/login" || location === "/register";
  
  // For demo purposes, we're allowing access to all routes
  // In a real app, you would redirect to login if not authenticated
  
  return (
    <>
      {isAuthRoute ? (
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </Switch>
      ) : (
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/income-expenses" component={IncomeExpenses} />
            <Route path="/budgets" component={Budgets} />
            <Route path="/financial-advice" component={FinancialAdvice} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
