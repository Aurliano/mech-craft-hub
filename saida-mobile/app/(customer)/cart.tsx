/**
 * Cart screen
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Badge } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { removeFromCart, createOrder, CartItem } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function CartScreen() {
  const { cartItems, cart, isLoadingDashboard } = useAuth();
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleRemoveItem = (itemId: string) => {
    removeMutation.mutate(itemId);
  };

  const handleCheckout = async () => {
    if (!cart || cartItems.length === 0) return;

    // Create orders from cart items
    for (const item of cartItems) {
      try {
        await createOrderMutation.mutateAsync({
          service: item.service.id,
          field_values: item.field_values,
          needs_documentation: item.needs_documentation,
        });
      } catch (error) {
        console.error('Error creating order:', error);
      }
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.cartItem}>
      <CardContent>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.service.name}</Text>
          <Button
            title="حذف"
            onPress={() => handleRemoveItem(item.id)}
            variant="destructive"
            size="sm"
          />
        </View>
        {item.needs_documentation && (
          <Badge variant="primary" size="sm" style={styles.badge}>
            نیاز به مستندات
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  if (isLoadingDashboard) {
    return <Loading fullScreen message="در حال بارگذاری..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>سبد خرید خالی است</Text>
          </View>
        }
      />
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="تسویه حساب"
            onPress={handleCheckout}
            loading={createOrderMutation.isPending}
            fullWidth
          />
        </View>
      )}
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
  cartItem: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.foreground,
    flex: 1,
  },
  badge: {
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
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

