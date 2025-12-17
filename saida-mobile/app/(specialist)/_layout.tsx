/**
 * Specialist routes layout with Stack Navigator
 * Note: Using Stack instead of Drawer to avoid Worklets version mismatch with Expo Go
 * For full functionality, use Development Build (see DEVELOPMENT_BUILD.md)
 */
import { Stack } from 'expo-router';
import { colors, typography } from '@/theme';

export default function SpecialistLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primaryForeground,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
          fontSize: typography.fontSize.lg,
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'داشبورد متخصص',
        }}
      />
    </Stack>
  );
}

