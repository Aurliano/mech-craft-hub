/**
 * Specialist Dashboard screen
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function SpecialistDashboardScreen() {
  const { user, isLoadingDashboard } = useAuth();

  if (isLoadingDashboard) {
    return <Loading fullScreen message="در حال بارگذاری..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>سلام {user?.first_name || user?.username}!</Text>
        <Text style={styles.subtitle}>داشبورد متخصص</Text>
      </View>

      <Card style={styles.section}>
        <CardHeader>
          <CardTitle>
            <Text>پروفایل</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text style={styles.emptyText}>در حال توسعه...</Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryForeground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.primaryForeground,
    opacity: 0.9,
  },
  section: {
    margin: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    padding: spacing.lg,
  },
});

