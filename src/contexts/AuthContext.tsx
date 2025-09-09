import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMe, useLogout, useUserOrders, useUserCart, useUserCartItems, useUserNotifications, useUserStats, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  logout: () => void;
  isLoading: boolean;
  // Role checking
  isContractor: boolean;
  isCustomer: boolean;
  // Dashboard data
  orders: any[];
  cart: any;
  cartItems: any[];
  notifications: any[];
  stats: any;
  isLoadingDashboard: boolean;
  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  
  // Dashboard data queries with error handling
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useUserOrders();
  const { data: cart, isLoading: isLoadingCart, error: cartError } = useUserCart();
  const { data: cartItemsData, isLoading: isLoadingCartItems, error: cartItemsError } = useUserCartItems();
  const { data: notificationsData, isLoading: isLoadingNotifications, error: notificationsError } = useUserNotifications();
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useUserStats();
  
  // Notification actions
  const { mutate: markNotificationRead } = useMarkNotificationRead();
  const { mutate: markAllNotificationsRead } = useMarkAllNotificationsRead();
  
  // Ensure arrays are always returned, even on error
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const cartItems = Array.isArray(cartItemsData) ? cartItemsData : [];
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  
  const isAuthenticated = Boolean(user);
  const isLoadingDashboard = isLoadingOrders || isLoadingCart || isLoadingCartItems || isLoadingNotifications || isLoadingStats;
  
  // Role checking
  const isContractor = user?.roles?.some((role: any) => role.role?.name === 'contractor' && role.is_active) || false;
  const isCustomer = user?.roles?.some((role: any) => role.role?.name === 'customer' && role.is_active) || false;
  
  // Log errors for debugging
  if (ordersError) console.warn('Error fetching orders:', ordersError);
  if (cartError) console.warn('Error fetching cart:', cartError);
  if (cartItemsError) console.warn('Error fetching cart items:', cartItemsError);
  if (notificationsError) console.warn('Error fetching notifications:', notificationsError);
  if (statsError) console.warn('Error fetching stats:', statsError);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      logout, 
      isLoading,
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
