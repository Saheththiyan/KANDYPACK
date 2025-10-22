import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CustomerLayout } from "./customer/components/CustomerLayout";
import { AdminLayout } from "./admin/components/AdminLayout";
import CustomerHome from "./customer/pages/Home";
import CustomerProducts from "./customer/pages/Products";
import CustomerCart from "./customer/pages/Cart";
import CustomerOrders from "./customer/pages/Orders";
import CustomerOrderDetails from "./customer/pages/OrderDetails";
import CustomerCardPayment from "./customer/pages/CardPayment";
import CustomerProfile from "./customer/pages/Profile";
import AdminDashboard from "./admin/pages/Dashboard";
import QuarterlySales from "./admin/pages/reports/QuarterlySales";
import MostOrdered from "./admin/pages/reports/MostOrdered";
import CityRoute from "./admin/pages/reports/CityRoute";
import DriverHours from "./admin/pages/reports/DriverHours";
import TruckUsage from "./admin/pages/reports/TruckUsage";
import CustomerHistory from "./admin/pages/reports/CustomerHistory";
import Customers from "./admin/pages/Customers";
import Product from "./admin/pages/Products";
import PublicLandingDashboard from "./pages/PublicLandingDashboard";
import PublicProducts from "./pages/PublicProducts";
import Allocations from "./admin/pages/Allocations";

const queryClient = new QueryClient();

const App = () => {
  // Initialize theme on app load
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLandingDashboard />} />
            <Route path="/products" element={<PublicProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="products" element={<Product />} />
              <Route path="allocations" element={<Allocations />} />
              <Route path="reports/quarterly-sales" element={<QuarterlySales />} />
              <Route path="reports/most-ordered" element={<MostOrdered />} />
              <Route path="reports/city-route-breakdown" element={<CityRoute />} />
              <Route path="reports/driver-hours" element={<DriverHours />} />
              <Route path="reports/truck-usage" element={<TruckUsage />} />
              <Route path="reports/customer-history" element={<CustomerHistory />} />
            </Route>
            
            {/* Customer Routes */}
            <Route path="/customer" element={
              <ProtectedRoute requiredRole={["Customer", "Admin"]}>
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CustomerHome />} />
              <Route path="products" element={<CustomerProducts />} />
              <Route path="cart" element={<CustomerCart />} />
              <Route path="payment" element={<CustomerCardPayment />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="orders/:id" element={<CustomerOrderDetails />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
