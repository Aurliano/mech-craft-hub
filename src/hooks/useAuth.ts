import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginRequest, registerRequest, meRequest, setTokens, clearTokens, getAccessToken } from '@/lib/api';

export function useMe() {
  const enabled = Boolean(getAccessToken());
  return useQuery<any>({
    queryKey: ['me'],
    queryFn: meRequest,
    enabled,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    clearTokens();
    qc.clear();
  };
} 