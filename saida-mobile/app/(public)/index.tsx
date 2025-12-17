/**
 * Home/Index screen with logo and improved UI
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { Button } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image
            source={require('@/assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>سایدا</Text>
          <Text style={styles.subtitle}>پلتفرم خدمات مهندسی مکانیک</Text>
          <Text style={styles.description}>
            طراحی، تحلیل، نقشه‌کشی و ساخت قطعات و سیستم‌های مکانیکی
          </Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.actions,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {!isAuthenticated ? (
          <>
            <Button
              title="ورود"
              onPress={() => router.push('/(auth)/login')}
              fullWidth
              style={styles.button}
            />
            <Button
              title="ثبت نام"
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
              fullWidth
              style={styles.button}
            />
          </>
        ) : (
          <Button
            title="ورود به داشبورد"
            onPress={() => router.push('/(customer)/dashboard')}
            fullWidth
            style={styles.button}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  gradient: {
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  hero: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryForeground,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryForeground,
    marginBottom: spacing.sm,
    textAlign: 'center',
    opacity: 0.95,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.primaryForeground,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    opacity: 0.9,
    marginTop: spacing.md,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

