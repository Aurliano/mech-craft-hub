/**
 * Custom hooks for authentication
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loginRequest,
  customerRegisterRequest,
  contractorRegisterRequest,
  specialistRegisterRequest,
  passwordResetRequest,
  passwordResetConfirm,
  phoneVerificationRequest,
  phoneVerificationConfirm,
  changePassword,
  LoginParams,
  RegisterParams,
  ContractorRegisterParams,
  PasswordResetRequestParams,
  PasswordResetConfirmParams,
  PhoneVerificationParams,
  PhoneVerificationConfirmParams,
  ChangePasswordParams,
} from '@/lib/api';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook for login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuthContext();

  return useMutation({
    mutationFn: (params: LoginParams) => loginRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      refetchUser();
    },
  });
}

/**
 * Hook for customer registration
 */
export function useCustomerRegister() {
  return useMutation({
    mutationFn: (params: RegisterParams) => customerRegisterRequest(params),
  });
}

/**
 * Hook for contractor registration
 */
export function useContractorRegister() {
  return useMutation({
    mutationFn: (params: ContractorRegisterParams) => contractorRegisterRequest(params),
  });
}

/**
 * Hook for specialist registration
 */
export function useSpecialistRegister() {
  return useMutation({
    mutationFn: (params: RegisterParams) => specialistRegisterRequest(params),
  });
}

/**
 * Hook for password reset request
 */
export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (params: PasswordResetRequestParams) => passwordResetRequest(params),
  });
}

/**
 * Hook for password reset confirm
 */
export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: (params: PasswordResetConfirmParams) => passwordResetConfirm(params),
  });
}

/**
 * Hook for phone verification request
 */
export function usePhoneVerificationRequest() {
  return useMutation({
    mutationFn: (params: PhoneVerificationParams) => phoneVerificationRequest(params),
  });
}

/**
 * Hook for phone verification confirm
 */
export function usePhoneVerificationConfirm() {
  return useMutation({
    mutationFn: (params: PhoneVerificationConfirmParams) => phoneVerificationConfirm(params),
  });
}

/**
 * Hook for change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (params: ChangePasswordParams) => changePassword(params),
  });
}

/**
 * Hook to get current user
 */
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { meRequest } = await import('@/lib/api');
      return meRequest();
    },
    retry: false,
  });
}

