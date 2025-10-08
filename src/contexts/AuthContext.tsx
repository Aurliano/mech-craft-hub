import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMe, useLogout, useUserOrders, useUserCart, useUserCartItems, useUserNotifications, useUserStats, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useAuth';
import { isAuthenticated } from '@/lib/api';

interface UserRoleItem {
  role?: { name?: string };
  is_active?: boolean;
}

interface BasicUser {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  roles?: UserRoleItem[];
  role?: { name?: string };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: BasicUser | null;
  logout: () => void;
  isLoading: boolean;
  // Role checking
  isContractor: boolean;
  isCustomer: boolean;
  // Dashboard data
  orders: unknown[];
  cart: unknown;
  cartItems: unknown[];
  notifications: unknown[];
  stats: unknown;
  isLoadingDashboard: boolean;
  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; user: BasicUser | null; isLoading: boolean}>({
    isAuthenticated: isAuthenticated(),
    user: null,
    isLoading: true
  });

  const { data: user, isLoading, error: userError } = useMe();
  const logout = useLogout();
  
  // Dashboard data queries with error handling - only run if authenticated
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useUserOrders();
  const { data: cart, isLoading: isLoadingCart, error: cartError } = useUserCart();
  const { data: cartItemsData, isLoading: isLoadingCartItems, error: cartItemsError } = useUserCartItems();
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useUserNotifications();
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useUserStats();
  
  // Notification actions
  const { mutate: markNotificationRead } = useMarkNotificationRead();
  const { mutate: markAllNotificationsRead } = useMarkAllNotificationsRead();
  
  // Update auth state when user data changes
  useEffect(() => {
    if (userError) {
      console.log('User authentication failed:', userError);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    } else if (user) {
      setAuthState({
        isAuthenticated: true,
        user: user,
        isLoading: false
      });
    } else if (!isLoading) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  }, [user, userError, isLoading]);
  
  // Ensure arrays are always returned, even on error
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const cartItems = Array.isArray(cartItemsData) ? cartItemsData : [];
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  
  const isLoadingDashboard = isLoadingOrders || isLoadingCart || isLoadingCartItems || isLoadingNotifications || isLoadingStats;
  
  // Role checking (support both roles[] and role)
  const roleNames: string[] = (() => {
    if (!authState.user) return [];
    
    const listFromArray = (authState.user?.roles || [])
      .map((r: UserRoleItem) => (r?.role?.name && r.is_active !== false ? r.role.name : undefined))
      .filter(Boolean) as string[];
    const singleRole = authState.user?.role?.name ? [authState.user.role.name as string] : [];
    return Array.from(new Set([...listFromArray, ...singleRole]));
  })();
  const isContractor = roleNames.includes('contractor');
  const isCustomer = roleNames.includes('customer');
  
  // Log errors for debugging
  if (ordersError) console.warn('Error fetching orders:', ordersError);
  if (cartError) console.warn('Error fetching cart:', cartError);
  if (cartItemsError) console.warn('Error fetching cart items:', cartItemsError);
  if (notificationsError) console.warn('Error fetching notifications:', notificationsError);
  if (statsError) console.warn('Error fetching stats:', statsError);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: authState.isAuthenticated, 
      user: authState.user, 
      logout, 
      isLoading: authState.isLoading,
      isContractor,
      isCustomer,
      orders,
      cart,
      cartItems,
      notifications,
      stats,
      isLoadingDashboard,
      markNotificationRead,
      markAllNotificationsRead
    }}>
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
