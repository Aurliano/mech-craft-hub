/**
 * Orders screen
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Badge, Loading } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getOrderById, Order } from '@/lib/api';
import { useNavigation } from '@react-navigation/native';

export default function OrdersScreen() {
  const navigation = useNavigation();
  const { orders, isLoadingDashboard } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => {
        // Navigate to order details
        navigation.navigate('OrderDetails' as never, { orderId: item.id } as never);
      }}
    >
      <Card style={styles.orderCard}>
        <CardContent>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{item.order_number}</Text>
            <Badge variant={getStatusColor(item.status) as any}>{item.status}</Badge>
          </View>
          <Text style={styles.orderDate}>
            {new Date(item.created_at).toLocaleDateString('fa-IR')}
          </Text>
          <View style={styles.orderFooter}>
            <Text style={styles.orderAmount}>
              {item.total_amount.toLocaleString()} تومان
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  if (isLoadingDashboard) {
    return <Loading fullScreen message="در حال بارگذاری..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>هیچ سفارشی وجود ندارد</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
  orderCard: {
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  orderDate: {
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  orderFooter: {
    marginTop: spacing.sm,
  },
  orderAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.mutedForeground,
  },
});

