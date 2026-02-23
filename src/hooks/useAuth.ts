import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  customerRegisterRequest, contractorRegisterRequest, specialistRegisterRequest, meRequest, setTokens, clearTokens, getAccessToken,
  loginRequest, passwordResetRequest, passwordResetConfirm, changePassword,
  phoneVerificationRequest, phoneVerificationConfirm, checkPhoneVerificationStatus,
  getUserOrders, getUserCart, getUserCartItems, getUserNotifications, getUserStats,
  createOrder, getOrderById, updateOrderStatus, createQuote, getQuotesByOrder, 
  acceptQuote, rejectQuote, addOrderToCart, removeFromCart, processPayment, downloadInvoice,
  markNotificationRead, markAllNotificationsRead,
  getContractorOrders, getContractorProposals, getContractorActiveProjects,
  getContractorStats, createContractorProposal, getContractorWorkshops,
  createContractorWorkshop, checkContractorManufacturingService,
  loginWithTurnstile, registerWithTurnstile, getFallbackCaptchaStatus, 
  getFallbackCaptchaChallenge, verifyFallbackCaptcha,
  getServiceTabs, getTabFields, getScopes, getServices, getServiceFields, getAllServices,
  createJobSeekerProfile, getJobSeekerProfile, updateJobSeekerProfile,
  createWorkRequest, getWorkRequests, updateWorkRequestStatus,
  getJobMatches, createJobMatch, updateJobMatchStatus,
  getWorkContracts, createWorkContract, signContract
} from '@/lib/api';
import { navigateAfterLogin, navigateAfterPhoneVerification, navigateAfterRegister } from '@/lib/navigation';
export * from './useWorkforce';

export function useMe() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ id: string; username: string; email: string; first_name?: string; last_name?: string; roles?: { role?: { name?: string } }[]; role?: { name?: string } }>({
    queryKey: ['me'],
    queryFn: meRequest,
    enabled,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { username: string; password: string }) => loginRequest(params),
    onSuccess: async () => {
      // Tokens set by api.loginRequest typically; ensure set if needed
      // Fetch user and route to role-based dashboard
      await qc.invalidateQueries({ queryKey: ['me'] });
      const me = await meRequest();
      navigateAfterLogin(me);
    },
  });
}

export function useCustomerRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerRegisterRequest,
    onSuccess: async (data: { phone?: string }) => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      navigateAfterRegister(data.phone || '');
    },
  });
}

export function useContractorRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contractorRegisterRequest,
    onSuccess: async (data: { phone?: string }) => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      navigateAfterRegister(data.phone || '');
    },
  });
}

export function useSpecialistRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: specialistRegisterRequest,
    onSuccess: async (data: { phone?: string }) => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      navigateAfterRegister(data.phone || '');
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    clearTokens();
    qc.clear();
    // پس از خروج، به صفحه ورود برویم
    navigateAfterPhoneVerification();
  };
}

// Password Reset Hooks
export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: passwordResetRequest,
  });
}

export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      passwordResetConfirm(token, newPassword),
    onSuccess: () => {
      // پس از تنظیم رمز، به صفحه ورود برو
      navigateAfterPhoneVerification();
    },
  });
}

export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      changePassword(oldPassword, newPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

// Phone Verification Hooks
export function usePhoneVerificationRequest() {
  return useMutation({
    mutationFn: phoneVerificationRequest,
  });
}

export function usePhoneVerificationConfirm() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      phoneVerificationConfirm(phone, code),
    onSuccess: (_data: { detail: string }) => {
      // پس از تایید، به صفحه ورود برو
      navigateAfterPhoneVerification();
    },
  });
}

// Phone Verification Status Hook
export function usePhoneVerificationStatus() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ 
    phone: string; 
    is_phone_verified: boolean; 
    verification_required: boolean; 
    message: string; 
  }>({
    queryKey: ['phoneVerificationStatus'],
    queryFn: checkPhoneVerificationStatus,
    enabled,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Scopes and Services Hooks
export function useScopes() {
  return useQuery<{ id: string; name: string; description?: string }[]>({
    queryKey: ['scopes'],
    queryFn: getScopes,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useServices(scopeId?: string) {
  return useQuery<{ id: string; name: string; type: string; has_tabs?: boolean }[]>({
    queryKey: ['services', scopeId],
    queryFn: () => getServices(scopeId),
    enabled: Boolean(scopeId),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useServiceTabs(serviceId: string) {
  return useQuery<{ id: string; name: string; display_name: string; description?: string; order: number; is_active: boolean }[]>({
    queryKey: ['serviceTabs', serviceId],
    queryFn: () => getServiceTabs(serviceId),
    enabled: Boolean(serviceId),
    retry: false,
  });
}

export function useTabFields(tabId: string) {
  return useQuery<{ id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[]>({
    queryKey: ['tabFields', tabId],
    queryFn: () => getTabFields(tabId),
    enabled: Boolean(tabId),
    retry: false,
  });
}

export function useServiceFields(serviceId: string, tabId?: string) {
  return useQuery<{ id: string; name: string; field_key: string; type: string; options?: { value: string; label: string }[]; is_required: boolean; order: number; help_text?: string }[]>({
    queryKey: ['serviceFields', serviceId, tabId],
    queryFn: () => getServiceFields(serviceId, tabId),
    enabled: Boolean(serviceId),
    retry: false,
  });
}

export function useService(serviceId: string) {
  return useQuery<{ id: string; name: string; type: string; has_tabs?: boolean } | undefined>({
    queryKey: ['service', serviceId],
    queryFn: () => getAllServices().then(services => services.find(s => s.id === serviceId)),
    enabled: Boolean(serviceId),
    retry: false,
  });
}

// Dashboard Hooks
export function useUserOrders() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ id: string; order_number: string; status: string; created_at: string; total_amount?: number }[]>({
    queryKey: ['userOrders'],
    queryFn: getUserOrders,
    enabled,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useUserCart() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ id: string; service_name: string; status: string; created_at: string }[]>({
    queryKey: ['userCart'],
    queryFn: getUserCart,
    enabled,
    retry: false,
  });
}

export function useUserCartItems() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ id: string; service_name: string; status: string; created_at: string }[]>({
    queryKey: ['userCartItems'],
    queryFn: getUserCartItems,
    enabled,
    retry: false,
  });
}

export function useUserNotifications() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ id: string; title: string; message: string; createdAt: string; isRead?: boolean }[]>({
    queryKey: ['userNotifications'],
    queryFn: getUserNotifications,
    enabled,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export function useUserStats() {
  const enabled = Boolean(getAccessToken());
  return useQuery<{ totalOrders?: number; pendingOrders?: number; completedOrders?: number }>({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled,
    retry: false,
  });
}

// Order Management Hooks
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userOrders'] });
      qc.invalidateQueries({ queryKey: ['userStats'] });
      qc.invalidateQueries({ queryKey: ['contractorOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorProposals'] });
      qc.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });
}

export function useGetOrderById(orderId: string | undefined) {
  const enabled = Boolean(getAccessToken() && orderId);
  return useQuery<unknown>({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId!),
    enabled,
    retry: false,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userOrders'] });
      qc.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
}

// Quote Management Hooks
export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['userOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorProposals'] });
      qc.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });
}

export function useGetQuotesByOrder(orderId: string | undefined) {
  const enabled = Boolean(getAccessToken() && orderId);
  return useQuery<unknown[]>({
    queryKey: ['quotes', orderId],
    queryFn: () => getQuotesByOrder(orderId!),
    enabled,
    retry: false,
  });
}

export function useAcceptQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptQuote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['order'] });
      qc.invalidateQueries({ queryKey: ['userOrders'] });
      qc.invalidateQueries({ queryKey: ['userCart'] });
      qc.invalidateQueries({ queryKey: ['contractorOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorProposals'] });
      qc.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectQuote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['order'] });
      qc.invalidateQueries({ queryKey: ['userOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorProposals'] });
      qc.invalidateQueries({ queryKey: ['userNotifications'] });
    },
  });
}

// Cart Management Hooks
export function useAddOrderToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addOrderToCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userCart'] });
      qc.invalidateQueries({ queryKey: ['userCartItems'] });
      qc.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userCart'] });
      qc.invalidateQueries({ queryKey: ['userCartItems'] });
      qc.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
}

// Payment Hooks
export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentData }: { orderId: string; paymentData: { amount: number; method: string; payment_type?: string; gateway_response?: unknown } }) =>
      processPayment(orderId, paymentData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userOrders'] });
      qc.invalidateQueries({ queryKey: ['userCart'] });
      qc.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: downloadInvoice,
  });
}

// Notification Hooks
export function useNotifications() {
  return useQuery<unknown[]>({
    queryKey: ['notifications'],
    queryFn: getUserNotifications,
    enabled: Boolean(getAccessToken()),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Contractor Hooks
export function useContractorOrders() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<unknown[]>({
    queryKey: ['contractorOrders'],
    queryFn: getContractorOrders,
    enabled,
    retry: false,
  });
}

export function useContractorProposals() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<unknown[]>({
    queryKey: ['contractorProposals'],
    queryFn: getContractorProposals,
    enabled,
    retry: false,
  });
}

export function useContractorActiveProjects() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<unknown[]>({
    queryKey: ['contractorActiveProjects'],
    queryFn: getContractorActiveProjects,
    enabled,
    retry: false,
  });
}

export function useContractorStats() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<unknown>({
    queryKey: ['contractorStats'],
    queryFn: getContractorStats,
    enabled,
    retry: false,
  });
}

export function useCreateContractorProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContractorProposal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contractorProposals'] });
      qc.invalidateQueries({ queryKey: ['contractorOrders'] });
      qc.invalidateQueries({ queryKey: ['contractorStats'] });
    },
  });
}

export function useContractorWorkshops() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  type ContractorWorkshop = {
    id: string | number;
    name: string;
    description?: string;
    is_active?: boolean;
    address?: string;
    postal_address?: string;
    manager_name?: string;
    manager_phone?: string;
    province?: string;
    city?: string;
    capabilities?: string[];
    machines?: { name: string; precision: string }[];
    rating?: number;
    completedProjects?: number;
    created_at?: string;
  };
  return useQuery<ContractorWorkshop[]>({
    queryKey: ['contractorWorkshops'],
    queryFn: async () => {
      const data = await getContractorWorkshops();
      return Array.isArray(data) ? (data as unknown as ContractorWorkshop[]) : [];
    },
    enabled,
    retry: false,
  });
}

export function useCreateContractorWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContractorWorkshop,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contractorWorkshops'] });
    },
  });
}

export function useCheckContractorManufacturingService() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery({
    queryKey: ['contractor-manufacturing-service'],
    queryFn: checkContractorManufacturingService,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Turnstile Authentication Hooks
export function useLoginWithCaptcha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginWithTurnstile,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      const me = await meRequest();
      navigateAfterLogin(me);
    },
  });
}

export function useRegisterWithCaptcha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerWithTurnstile,
    onSuccess: async (data: { phone?: string }) => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      navigateAfterRegister(data.phone || '');
    },
  });
}

// Fallback Captcha Hooks
export function useFallbackCaptchaStatus() {
  return useQuery({
    queryKey: ['fallback-captcha-status'],
    queryFn: getFallbackCaptchaStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFallbackCaptchaChallenge() {
  return useMutation({
    mutationFn: getFallbackCaptchaChallenge,
  });
}

export function useVerifyFallbackCaptcha() {
  return useMutation({
    mutationFn: ({ challengeId, answer }: { challengeId: string; answer: string }) =>
      verifyFallbackCaptcha(challengeId, answer),
  });
}
