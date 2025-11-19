import "./global.css";

import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import LeadsDashboard from "./pages/LeadsDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/sales-persons" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<AdminDashboard />} />
          <Route path="/leads" element={<LeadsDashboard />} />
          <Route path="/admin/leads" element={<LeadsDashboard />} />
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/admin/sales" element={<SalesDashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
