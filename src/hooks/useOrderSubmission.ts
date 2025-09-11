import { useState } from 'react';
import { useCreateOrder } from './useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useOrderSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
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
      
      // Show success toast
      toast({
        title: "سفارش با موفقیت ثبت شد! 🎉",
        description: "سفارش شما با موفقیت ثبت شد و به زودی بررسی خواهد شد.",
        duration: 3000,
      });
      
      // Redirect to orders page after successful submission
      // Use React Router navigation instead of window.location
      setTimeout(() => {
        window.location.href = '/orders';
      }, 2000); // Increased delay to show toast
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'خطا در ثبت سفارش';
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "خطا در ثبت سفارش ❌",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
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
