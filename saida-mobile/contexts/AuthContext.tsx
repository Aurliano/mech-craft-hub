/**
 * Authentication Context for Saida Mobile App
 * Manages user authentication state and provides auth methods
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  meRequest,
  logoutRequest,
  getUserOrders,
  getUserCart,
  getCartItems,
  getUserNotifications,
  markNotificationRead as apiMarkNotificationRead,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  User,
  Order,
  CartItem,
  Notification,
} from '@/lib/api';
import { isAuthenticated as checkIsAuthenticated } from '@/lib/storage';
import { USER_ROLES } from '@/config/constants';

interface UserRoleItem {
  role?: { name?: string };
  is_active?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  // Role checking
  isContractor: boolean;
  isCustomer: boolean;
  isSpecialist: boolean;
  // Dashboard data
  orders: Order[];
  cart: { id: string; items: CartItem[] } | null;
  cartItems: CartItem[];
  notifications: Notification[];
  stats: unknown;
  isLoadingDashboard: boolean;
  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Refresh data
  refetchUser: () => void;
  refetchDashboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const queryClient = useQueryClient();

  // Check initial auth state
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await checkIsAuthenticated();
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: authenticated,
        isLoading: false,
      }));
    };
    checkAuth();
  }, []);

  // Fetch user data
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: meRequest,
    enabled: authState.isAuthenticated,
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.clear();
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    },
  });

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  // Dashboard data queries
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders,
    enabled: authState.isAuthenticated,
  });

  const { data: cart, isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart'],
    queryFn: getUserCart,
    enabled: authState.isAuthenticated,
  });

  const { data: cartItemsData, isLoading: isLoadingCartItems } = useQuery({
    queryKey: ['cartItems'],
    queryFn: getCartItems,
    enabled: authState.isAuthenticated,
  });

  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getUserNotifications,
    enabled: authState.isAuthenticated,
  });

  // Notification mutations
  const markReadMutation = useMutation({
    mutationFn: apiMarkNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: apiMarkAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Update auth state when user data changes
  useEffect(() => {
    if (userError) {
      console.log('User authentication failed:', userError);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } else if (user) {
      setAuthState({
        isAuthenticated: true,
        user: user,
        isLoading: isLoadingUser,
      });
    } else if (!isLoadingUser && authState.isAuthenticated) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [user, userError, isLoadingUser, authState.isAuthenticated]);

  // Ensure arrays are always returned, even on error
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const cartItems = Array.isArray(cartItemsData) ? cartItemsData : [];
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const isLoadingDashboard =
    isLoadingOrders || isLoadingCart || isLoadingCartItems || isLoadingNotifications;

  // Role checking
  const roleNames: string[] = (() => {
    if (!authState.user) return [];

    const listFromArray = (authState.user?.roles || [])
      .map((r: UserRoleItem) => (r?.role?.name && r.is_active !== false ? r.role.name : undefined))
      .filter(Boolean) as string[];
    const singleRole = authState.user?.role?.name ? [authState.user.role.name as string] : [];
    return Array.from(new Set([...listFromArray, ...singleRole]));
  })();

  const isContractor = roleNames.includes(USER_ROLES.CONTRACTOR);
  const isCustomer = roleNames.includes(USER_ROLES.CUSTOMER);
  const isSpecialist = roleNames.includes(USER_ROLES.SPECIALIST);

  const markNotificationRead = useCallback(
    (id: string) => {
      markReadMutation.mutate(id);
    },
    [markReadMutation]
  );

  const markAllNotificationsRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const refetchDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        logout,
        isLoading: authState.isLoading,
        isContractor,
        isCustomer,
        isSpecialist,
        orders,
        cart,
        cartItems,
        notifications,
        stats: null, // TODO: Implement stats endpoint
        isLoadingDashboard,
        markNotificationRead,
        markAllNotificationsRead,
        refetchUser: () => refetchUser(),
        refetchDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

