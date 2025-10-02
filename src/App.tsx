import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import SecurityHeaders from "@/components/SecurityHeaders";
import ErrorBoundary from "@/components/ErrorBoundary";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import SupportWidget from "@/components/SupportWidget";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContractorRegister from "./pages/ContractorRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PhoneVerification from "./pages/PhoneVerification";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import AnalysisSimulation from "./pages/AnalysisSimulation";
import Design from "./pages/Design";
import DrawingService from "./pages/DrawingService";
import Manufacturing from "./pages/Manufacturing";
import ContractorDashboard from "./pages/ContractorDashboard";
import ContractorQuotes from "./pages/ContractorQuotes";
import ContractorProjects from "./pages/ContractorProjects";
import ContractorRatings from "./pages/ContractorRatings";
import CustomerQuotes from "./pages/CustomerQuotes";
import MyWorkshops from "./pages/MyWorkshops";
import OrderDetails from "./pages/OrderDetails";
import FileUploadDemo from "./pages/FileUploadDemo";
import OrderPreviewDemo from "./pages/OrderPreviewDemo";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import Blog from "./pages/Blog";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // فقط یک بار retry
      retryDelay: 5000, // 5 ثانیه تاخیر
      staleTime: 5 * 60 * 1000, // 5 دقیقه cache
      refetchOnWindowFocus: false, // عدم refetch هنگام focus
      refetchOnMount: false, // عدم refetch هنگام mount
      refetchOnReconnect: false, // عدم refetch هنگام reconnect
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <AuthProvider>
          <SecurityHeaders>
            <TooltipProvider>
              <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contractor-register" element={<ContractorRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/phone-verification" element={<PhoneVerification />} />
              
              {/* Customer Routes - Only accessible by customers */}
              <Route path="/dashboard" element={
                <RoleBasedRoute allowedRoles={['customer']} fallbackPath="/contractor-dashboard">
                  <Dashboard />
                </RoleBasedRoute>
              } />
              <Route path="/orders" element={
                <RoleBasedRoute allowedRoles={['customer']} fallbackPath="/contractor-dashboard">
                  <Orders />
                </RoleBasedRoute>
              } />
              <Route path="/cart" element={
                <RoleBasedRoute allowedRoles={['customer']} fallbackPath="/contractor-dashboard">
                  <Cart />
                </RoleBasedRoute>
              } />
              
              {/* Contractor Routes - Only accessible by contractors */}
              <Route path="/contractor-dashboard" element={
                <RoleBasedRoute allowedRoles={['contractor']} fallbackPath="/dashboard">
                  <ContractorDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/contractor/quotes" element={
                <RoleBasedRoute allowedRoles={['contractor']} fallbackPath="/dashboard">
                  <ContractorQuotes />
                </RoleBasedRoute>
              } />
              <Route path="/contractor/projects" element={
                <RoleBasedRoute allowedRoles={['contractor']} fallbackPath="/dashboard">
                  <ContractorProjects />
                </RoleBasedRoute>
              } />
              <Route path="/contractor/ratings" element={
                <RoleBasedRoute allowedRoles={['contractor']} fallbackPath="/dashboard">
                  <ContractorRatings />
                </RoleBasedRoute>
              } />
              <Route path="/contractor/orders" element={
                <RoleBasedRoute allowedRoles={['contractor']} fallbackPath="/dashboard">
                  <ContractorQuotes />
                </RoleBasedRoute>
              } />
              <Route path="/my-workshops" element={
                <RoleBasedRoute allowedRoles={['contractor']} fallbackPath="/dashboard">
                  <MyWorkshops />
                </RoleBasedRoute>
              } />
              
              {/* Customer Quote Management */}
              <Route path="/quotes" element={
                <RoleBasedRoute allowedRoles={['customer']} fallbackPath="/contractor-dashboard">
                  <CustomerQuotes />
                </RoleBasedRoute>
              } />
              <Route path="/orders/:orderId" element={
                <RoleBasedRoute allowedRoles={['customer', 'contractor']} fallbackPath="/dashboard">
                  <OrderDetails />
                </RoleBasedRoute>
              } />
              
              {/* Service Pages - Accessible by everyone, but show LoginPrompt for unauthenticated users */}
              <Route path="/analysis" element={<AnalysisSimulation />} />
              <Route path="/design" element={<Design />} />
              <Route path="/drawing" element={<DrawingService />} />
              <Route path="/manufacturing" element={<Manufacturing />} />
              
              {/* Info Pages */}
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              
              {/* Shared Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/support" element={<Support />} />
              <Route path="/orders/:orderId" element={<OrderDetails />} />
              <Route path="/file-upload-demo" element={<FileUploadDemo />} />
              <Route path="/order-preview-demo" element={<OrderPreviewDemo />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              </BrowserRouter>
              <SupportWidget />
              <Toaster />
            </TooltipProvider>
          </SecurityHeaders>
        </AuthProvider>
      </SecurityProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
