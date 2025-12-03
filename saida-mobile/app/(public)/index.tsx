/**
 * Home/Index screen
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>سایدا</Text>
        <Text style={styles.subtitle}>پلتفرم خدمات مهندسی مکانیک</Text>
        <Text style={styles.description}>
          طراحی، تحلیل، نقشه‌کشی و ساخت قطعات و سیستم‌های مکانیکی
        </Text>
      </View>

      <View style={styles.actions}>
        {!isAuthenticated ? (
          <>
            <Button
              title="ورود"
              onPress={() => navigation.navigate('Auth' as never, { screen: 'Login' } as never)}
              fullWidth
              style={styles.button}
            />
            <Button
              title="ثبت نام"
              onPress={() => navigation.navigate('Auth' as never, { screen: 'Register' } as never)}
              variant="outline"
              fullWidth
              style={styles.button}
            />
          </>
        ) : (
          <Button
            title="ورود به داشبورد"
            onPress={() => navigation.navigate('Customer' as never)}
            fullWidth
            style={styles.button}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

