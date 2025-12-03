/**
 * Main App Navigator
 *
 * NOTE: We are inside Expo Router, which already provides a root NavigationContainer.
 * Therefore, this file MUST NOT create its own NavigationContainer, it should only
 * define navigator trees (Stack/Tab/Drawer) that Expo Router renders inside its container.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';

// Screens (will be created)
import LoginScreen from '@/app/(auth)/login';
import RegisterScreen from '@/app/(auth)/register';
import HomeScreen from '@/app/(public)/index';
import DashboardScreen from '@/app/(customer)/dashboard';
import OrdersScreen from '@/app/(customer)/orders';
import CartScreen from '@/app/(customer)/cart';
import ContractorDashboardScreen from '@/app/(contractor)/dashboard';
import SpecialistDashboardScreen from '@/app/(specialist)/dashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Customer Tab Navigator
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}

// Contractor Drawer Navigator
function ContractorDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.primaryForeground,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Drawer.Screen name="Dashboard" component={ContractorDashboardScreen} />
    </Drawer.Navigator>
  );
}

// Specialist Drawer Navigator
function SpecialistDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.primaryForeground,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Drawer.Screen name="Dashboard" component={SpecialistDashboardScreen} />
    </Drawer.Navigator>
  );
}

// Main App Navigator (no NavigationContainer here!)
export function AppNavigator() {
  const { isAuthenticated, isCustomer, isContractor, isSpecialist } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      ) : isCustomer ? (
        <Stack.Screen name="Customer" component={CustomerTabs} />
      ) : isContractor ? (
        <Stack.Screen name="Contractor" component={ContractorDrawer} />
      ) : isSpecialist ? (
        <Stack.Screen name="Specialist" component={SpecialistDrawer} />
      ) : (
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
}

