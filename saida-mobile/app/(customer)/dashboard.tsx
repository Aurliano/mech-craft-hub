/**
 * Customer Dashboard screen
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Loading } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, orders, cartItems, notifications, isLoadingDashboard, refetchDashboard } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetchDashboard();
    setRefreshing(false);
  }, [refetchDashboard]);

  if (isLoadingDashboard) {
    return <Loading fullScreen message="در حال بارگذاری..." />;
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>سلام {user?.first_name || user?.username}!</Text>
        <Text style={styles.subtitle}>به داشبورد خوش آمدید</Text>
      </View>

      <View style={styles.stats}>
        <Card style={styles.statCard}>
          <CardContent>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>سفارش‌ها</Text>
            <Button
              title="مشاهده همه"
              onPress={() => navigation.navigate('Orders' as never)}
              variant="ghost"
              size="sm"
              style={styles.statButton}
            />
          </CardContent>
        </Card>

        <Card style={styles.statCard}>
          <CardContent>
            <Text style={styles.statValue}>{cartItems.length}</Text>
            <Text style={styles.statLabel}>آیتم‌های سبد خرید</Text>
            <Button
              title="مشاهده سبد"
              onPress={() => navigation.navigate('Cart' as never)}
              variant="ghost"
              size="sm"
              style={styles.statButton}
            />
          </CardContent>
        </Card>

        <Card style={styles.statCard}>
          <CardContent>
            <Text style={styles.statValue}>{unreadNotifications}</Text>
            <Text style={styles.statLabel}>اعلان‌های خوانده نشده</Text>
          </CardContent>
        </Card>
      </View>

      <Card style={styles.section}>
        <CardHeader>
          <CardTitle>
            <Text>سفارش‌های اخیر</Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>هیچ سفارشی وجود ندارد</Text>
          ) : (
            orders.slice(0, 5).map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{order.order_number}</Text>
                  <Badge variant={order.status === 'completed' ? 'success' : 'default'}>
                    {order.status}
                  </Badge>
                </View>
                <Text style={styles.orderAmount}>{order.total_amount.toLocaleString()} تومان</Text>
              </View>
            ))
          )}
          {orders.length > 0 && (
            <Button
              title="مشاهده همه سفارش‌ها"
              onPress={() => navigation.navigate('Orders' as never)}
              variant="outline"
              fullWidth
              style={styles.moreButton}
            />
          )}
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
  stats: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  statButton: {
    marginTop: spacing.xs,
  },
  section: {
    margin: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  orderAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    padding: spacing.lg,
  },
  moreButton: {
    marginTop: spacing.md,
  },
});

