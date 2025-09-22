import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  loginRequest, registerRequest, meRequest, setTokens, clearTokens, getAccessToken,
  passwordResetRequest, passwordResetConfirm, changePassword,
  phoneVerificationRequest, phoneVerificationConfirm,
  getUserOrders, getUserCart, getUserCartItems, getUserNotifications, getUserStats,
  createOrder, getOrderById, updateOrderStatus, createQuote, getQuotesByOrder, 
  acceptQuote, rejectQuote, addOrderToCart, removeFromCart, processPayment, downloadInvoice,
  markNotificationRead, markAllNotificationsRead,
  getContractorOrders, getContractorProposals, getContractorActiveProjects,
  getContractorStats, createContractorProposal, getContractorWorkshops,
  createContractorWorkshop, checkContractorManufacturingService,
  loginWithTurnstile, registerWithTurnstile, getFallbackCaptchaStatus, 
  getFallbackCaptchaChallenge, verifyFallbackCaptcha,
  getServiceTabs, getTabFields, getScopes, getServices, getServiceFields, getAllServices
} from '@/lib/api';

export function useMe() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any>({
    queryKey: ['me'],
    queryFn: meRequest,
    enabled,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      qc.invalidateQueries({ queryKey: ['me'] });
      // Redirect to home page and refresh
      window.location.href = '/';
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      // Redirect to home page and refresh
      window.location.href = '/';
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    clearTokens();
    qc.clear();
    // Redirect to home page and refresh
    window.location.href = '/';
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
      // Redirect to home page and refresh after password reset
      window.location.href = '/';
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
    onSuccess: () => {
      // Redirect to home page and refresh after phone verification
      window.location.href = '/';
    },
  });
}

// Scopes and Services Hooks
export function useScopes() {
  return useQuery<any[]>({
    queryKey: ['scopes'],
    queryFn: getScopes,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useServices(scopeId?: string) {
  return useQuery<any[]>({
    queryKey: ['services', scopeId],
    queryFn: () => getServices(scopeId),
    enabled: Boolean(scopeId),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useServiceTabs(serviceId: string) {
  return useQuery<any[]>({
    queryKey: ['serviceTabs', serviceId],
    queryFn: () => getServiceTabs(serviceId),
    enabled: Boolean(serviceId),
    retry: false,
  });
}

export function useTabFields(tabId: string) {
  return useQuery<any[]>({
    queryKey: ['tabFields', tabId],
    queryFn: () => getTabFields(tabId),
    enabled: Boolean(tabId),
    retry: false,
  });
}

export function useServiceFields(serviceId: string, tabId?: string) {
  return useQuery<any[]>({
    queryKey: ['serviceFields', serviceId, tabId],
    queryFn: () => getServiceFields(serviceId, tabId),
    enabled: Boolean(serviceId),
    retry: false,
  });
}

export function useService(serviceId: string) {
  return useQuery<any>({
    queryKey: ['service', serviceId],
    queryFn: () => getAllServices().then(services => services.find(s => s.id === serviceId)),
    enabled: Boolean(serviceId),
    retry: false,
  });
}

// Dashboard Hooks
export function useUserOrders() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any[]>({
    queryKey: ['userOrders'],
    queryFn: getUserOrders,
    enabled,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export function useUserCart() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any>({
    queryKey: ['userCart'],
    queryFn: getUserCart,
    enabled,
    retry: false,
  });
}

export function useUserCartItems() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any[]>({
    queryKey: ['userCartItems'],
    queryFn: getUserCartItems,
    enabled,
    retry: false,
  });
}

export function useUserNotifications() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any[]>({
    queryKey: ['userNotifications'],
    queryFn: getUserNotifications,
    enabled,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export function useUserStats() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any>({
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

export function useGetOrderById(orderId: string) {
  const enabled = Boolean(getAccessToken() && orderId);
  return useQuery<any>({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
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

export function useGetQuotesByOrder(orderId: string) {
  const enabled = Boolean(getAccessToken() && orderId);
  return useQuery<any[]>({
    queryKey: ['quotes', orderId],
    queryFn: () => getQuotesByOrder(orderId),
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
    mutationFn: ({ orderId, paymentData }: { orderId: string; paymentData: any }) =>
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
  return useQuery<any[]>({
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
  return useQuery<any[]>({
    queryKey: ['contractorOrders'],
    queryFn: getContractorOrders,
    enabled,
    retry: false,
  });
}

export function useContractorProposals() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<any[]>({
    queryKey: ['contractorProposals'],
    queryFn: getContractorProposals,
    enabled,
    retry: false,
  });
}

export function useContractorActiveProjects() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<any[]>({
    queryKey: ['contractorActiveProjects'],
    queryFn: getContractorActiveProjects,
    enabled,
    retry: false,
  });
}

export function useContractorStats() {
  const { user } = useAuth();
  const enabled = Boolean(getAccessToken()) && user?.role?.name === 'contractor';
  return useQuery<any>({
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
  return useQuery<any[]>({
    queryKey: ['contractorWorkshops'],
    queryFn: getContractorWorkshops,
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
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      qc.invalidateQueries({ queryKey: ['me'] });
      // Redirect to home page and refresh
      window.location.href = '/';
    },
  });
}

export function useRegisterWithCaptcha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerWithTurnstile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      // Redirect to home page and refresh
      window.location.href = '/';
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
