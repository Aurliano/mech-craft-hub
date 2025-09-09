import { useState } from 'react';
import { useCreateOrder } from './useAuth';
import { useAuth } from '@/contexts/AuthContext';

export function useOrderSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const createOrderMutation = useCreateOrder();

  const submitOrder = async (orderData: {
    serviceId: string;
    fieldValues: Record<string, any>;
    needsDocumentation?: boolean;
    notes?: string;
    documentationOptions?: Record<string, boolean>;
  }) => {
    if (!user?.id) {
      setError('کاربر وارد نشده است');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        customer: user.id,
        status: 'submitted',
        notes: orderData.notes || '',
        documentation_options: orderData.documentationOptions || {},
        items: [{
          service: orderData.serviceId,
          field_values: orderData.fieldValues,
          needs_documentation: orderData.needsDocumentation || false,
        }]
      };

      const result = await createOrderMutation.mutateAsync(orderPayload);
      
      // Redirect to orders page after successful submission
      window.location.href = '/orders';
      
      return result;
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت سفارش');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOrder,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
