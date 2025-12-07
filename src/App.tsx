import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import SecurityHeaders from "@/components/SecurityHeaders";
import ErrorBoundary from "@/components/ErrorBoundary";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import SupportWidget from "@/components/SupportWidget";
import PWAInstallGuide from "@/components/PWAInstallGuide";
import SplashIntro from "@/components/SplashIntro";
import RouteSplash from "@/components/RouteSplash";
import VersionChecker from "@/components/VersionChecker";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContractorRegister from "./pages/ContractorRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PasswordResetSMS from "./pages/PasswordResetSMS";
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
import ServicesPage from "./pages/ServicesPage";
import SpecialistRegister from "./pages/SpecialistRegister";
import SpecialistDashboard from "./pages/SpecialistDashboard";
import SpecialistProfileForm from "./pages/SpecialistProfileForm";
import SpecialistOnboarding from "./pages/SpecialistOnboarding";
import SpecialistHiring from "./pages/SpecialistHiring";
import AdminSpecialistManagement from "./pages/AdminSpecialistManagement";
import Blog from "./pages/Blog";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import FileManager from "./pages/FileManager";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWorkforceManagement from "./pages/AdminWorkforceManagement";
import AdminWorkshopManagement from "./pages/AdminWorkshopManagement";
import NotFound from "./pages/NotFound";
import JobMarket from "./pages/JobMarket";
import JobSeekerRegistration from "./pages/JobSeekerRegistration";

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
              <Route path="/specialist-register" element={<SpecialistRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/password-reset-sms" element={<PasswordResetSMS />} />
              <Route path="/phone-verification" element={<PhoneVerification />} />
              
              {/* Customer Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Cart />
                </ProtectedRoute>
              } />
              
              {/* Contractor Routes - Only accessible by contractors */}
              <Route path="/contractor-dashboard" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Specialist Routes - Only accessible by specialists */}
              <Route path="/specialist-dashboard" element={
                <ProtectedRoute allowedRoles={['specialist']}>
                  <SpecialistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/specialist-onboarding" element={
                <ProtectedRoute allowedRoles={['specialist']}>
                  <SpecialistOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/specialist-profile" element={
                <ProtectedRoute allowedRoles={['specialist']}>
                  <SpecialistProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/contractor/quotes" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorQuotes />
                </ProtectedRoute>
              } />
              <Route path="/contractor/projects" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorProjects />
                </ProtectedRoute>
              } />
              <Route path="/contractor/ratings" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorRatings />
                </ProtectedRoute>
              } />
              <Route path="/contractor/orders" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <ContractorQuotes />
                </ProtectedRoute>
              } />
              <Route path="/my-workshops" element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <MyWorkshops />
                </ProtectedRoute>
              } />
              
              {/* Customer Quote Management */}
              <Route path="/quotes" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerQuotes />
                </ProtectedRoute>
              } />
              <Route path="/orders/:orderId" element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              } />
              
              {/* Service Pages - Accessible by everyone, but show LoginPrompt for unauthenticated users */}
              <Route path="/analysis" element={<AnalysisSimulation />} />
              <Route path="/design" element={<Design />} />
              <Route path="/drawing" element={<DrawingService />} />
              <Route path="/manufacturing" element={<Manufacturing />} />
              
              {/* Info Pages */}
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/specialist-hiring" element={<SpecialistHiring />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/job-market" element={<JobMarket />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/admin/file-manager" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <FileManager />
                </RoleBasedRoute>
              } />
              <Route path="/admin/workforce-management" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminWorkforceManagement />
                </RoleBasedRoute>
              } />
              <Route path="/admin/workshop-management" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminWorkshopManagement />
                </RoleBasedRoute>
              } />
              <Route path="/admin/specialist-management" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminSpecialistManagement />
                </RoleBasedRoute>
              } />
              
              {/* Workforce Management */}
              <Route path="/job-seeker/register" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <JobSeekerRegistration />
                </ProtectedRoute>
              } />
              
              {/* Shared Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              <RouteSplash />
              </BrowserRouter>
              <SplashIntro />
              <SupportWidget />
              <PWAInstallGuide />
              <VersionChecker />
              <Toaster />
              <SonnerToaster />
            </TooltipProvider>
          </SecurityHeaders>
        </AuthProvider>
      </SecurityProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
