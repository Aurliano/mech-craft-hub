import { useQuery } from '@tanstack/react-query';
import { getServiceFields } from '@/lib/api';

export function useServiceFields(serviceId: string) {
  return useQuery({
    queryKey: ['serviceFields', serviceId],
    queryFn: () => getServiceFields(serviceId),
    enabled: !!serviceId,
  });
}
